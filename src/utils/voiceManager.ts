// WebRTC Voice Chat Manager with Speaking Level Detection

export type VoiceState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface PeerConnectionMap {
  [peerId: string]: {
    pc: RTCPeerConnection;
    audioElem?: HTMLAudioElement;
  };
}

export class VoiceManager {
  private localStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;

  private peers: PeerConnectionMap = {};
  private currentUserId: string = '';
  private isMuted: boolean = false;
  private isDeafened: boolean = false;
  private state: VoiceState = 'disconnected';
  private errorMessage: string | null = null;

  private onStateChangeCb: ((state: VoiceState, err?: string | null) => void) | null = null;
  private onSpeakingChangeCb: ((isSpeaking: boolean) => void) | null = null;
  private sendSignalCb: ((targetPlayerId: string, signal: any) => void) | null = null;

  public setCallbacks(opts: {
    onStateChange: (state: VoiceState, err?: string | null) => void;
    onSpeakingChange: (isSpeaking: boolean) => void;
    sendSignal: (targetPlayerId: string, signal: any) => void;
  }) {
    this.onStateChangeCb = opts.onStateChange;
    this.onSpeakingChangeCb = opts.onSpeakingChange;
    this.sendSignalCb = opts.sendSignal;
  }

  public async joinVoice(userId: string): Promise<boolean> {
    this.currentUserId = userId;
    this.state = 'connecting';
    this.errorMessage = null;
    this.onStateChangeCb?.('connecting');

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.localStream = stream;
      this.setupVolumeDetection(stream);

      this.state = 'connected';
      this.onStateChangeCb?.('connected');
      return true;
    } catch (err: any) {
      console.warn('Voice join error:', err);
      this.state = 'error';
      this.errorMessage =
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Microphone permission denied. Please allow microphone access in your browser.'
          : 'Unable to access microphone: ' + (err.message || 'Device error');
      this.onStateChangeCb?.('error', this.errorMessage);
      return false;
    }
  }

  private setupVolumeDetection(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      let wasSpeaking = false;

      const checkVolume = () => {
        if (!this.analyser || this.isMuted) {
          if (wasSpeaking) {
            wasSpeaking = false;
            this.onSpeakingChangeCb?.(false);
          }
          this.animFrameId = requestAnimationFrame(checkVolume);
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const isSpeaking = avg > 20;

        if (isSpeaking !== wasSpeaking) {
          wasSpeaking = isSpeaking;
          this.onSpeakingChangeCb?.(isSpeaking);
        }

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      this.animFrameId = requestAnimationFrame(checkVolume);
    } catch {
      // Ignored
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !muted;
      });
    }
    if (muted) {
      this.onSpeakingChangeCb?.(false);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setDeafened(deafened: boolean) {
    this.isDeafened = deafened;
    Object.values(this.peers).forEach(p => {
      if (p.audioElem) {
        p.audioElem.muted = deafened;
      }
    });
  }

  public getDeafened(): boolean {
    return this.isDeafened;
  }

  public getState(): VoiceState {
    return this.state;
  }

  public getErrorMessage(): string | null {
    return this.errorMessage;
  }

  // Handle incoming peer joining voice channel
  public async handlePeerJoined(peerId: string) {
    if (this.state !== 'connected' || !this.localStream) return;
    if (this.peers[peerId]) return;

    const pc = this.createPeerConnection(peerId);
    this.peers[peerId] = { pc };

    // Add local tracks
    this.localStream.getTracks().forEach(track => {
      pc.addTrack(track, this.localStream!);
    });

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.sendSignalCb?.(peerId, { type: 'offer', sdp: offer });
    } catch (err) {
      console.warn('Error creating WebRTC offer:', err);
    }
  }

  public handlePeerLeft(peerId: string) {
    const peer = this.peers[peerId];
    if (peer) {
      peer.pc.close();
      if (peer.audioElem) {
        peer.audioElem.pause();
        peer.audioElem.srcObject = null;
        peer.audioElem.remove();
      }
      delete this.peers[peerId];
    }
  }

  // Handle WebRTC signaling messages
  public async handleSignal(fromPeerId: string, signal: any) {
    if (!this.localStream) return;

    let peer = this.peers[fromPeerId];
    if (!peer) {
      const pc = this.createPeerConnection(fromPeerId);
      this.peers[fromPeerId] = { pc };
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
      peer = this.peers[fromPeerId];
    }

    const { pc } = peer;

    try {
      if (signal.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.sendSignalCb?.(fromPeerId, { type: 'answer', sdp: answer });
      } else if (signal.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === 'candidate') {
        if (signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      }
    } catch (err) {
      console.warn('Error handling WebRTC signal:', err);
    }
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = event => {
      if (event.candidate) {
        this.sendSignalCb?.(peerId, {
          type: 'candidate',
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = event => {
      let audioElem = this.peers[peerId]?.audioElem;
      if (!audioElem) {
        audioElem = document.createElement('audio');
        audioElem.autoplay = true;
        audioElem.muted = this.isDeafened;
        document.body.appendChild(audioElem);
        if (this.peers[peerId]) {
          this.peers[peerId].audioElem = audioElem;
        }
      }
      audioElem.srcObject = event.streams[0];
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.handlePeerLeft(peerId);
      }
    };

    return pc;
  }

  public leaveVoice() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    Object.keys(this.peers).forEach(peerId => {
      this.handlePeerLeft(peerId);
    });

    this.state = 'disconnected';
    this.errorMessage = null;
    this.onSpeakingChangeCb?.(false);
    this.onStateChangeCb?.('disconnected');
  }
}

export const voice = new VoiceManager();
