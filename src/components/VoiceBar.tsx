import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, PhoneCall, PhoneOff, AlertCircle } from 'lucide-react';
import { Player, PlayerColor, RoomState } from '../types/game';
import { voice, VoiceState } from '../utils/voiceManager';
import { audio } from '../utils/audio';

interface VoiceBarProps {
  room: RoomState;
  currentUserId: string;
  voiceState: VoiceState;
  isMuted: boolean;
  isDeafened: boolean;
  isLocalSpeaking: boolean;
  voiceError: string | null;
  onJoinVoice: () => void;
  onLeaveVoice: () => void;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
}

const COLOR_BORDER_MAP: Record<PlayerColor, string> = {
  red: 'border-red-500',
  green: 'border-emerald-500',
  yellow: 'border-amber-500',
  blue: 'border-blue-500',
};

export const VoiceBar: React.FC<VoiceBarProps> = ({
  room,
  currentUserId,
  voiceState,
  isMuted,
  isDeafened,
  isLocalSpeaking,
  voiceError,
  onJoinVoice,
  onLeaveVoice,
  onToggleMute,
  onToggleDeafen,
}) => {
  const isConnected = voiceState === 'connected';
  const voiceUsers = room.voiceUsers || {};
  const activeVoiceUserIds = Object.keys(voiceUsers);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Status & Connected Voice Avatars */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              VOICE
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-emerald-500 animate-pulse'
                  : voiceState === 'connecting'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-slate-600'
              }`}
            />
          </div>

          {/* Active Voice Peers List */}
          <div className="flex items-center gap-1.5">
            {room.players.map(player => {
              const inVoice = activeVoiceUserIds.includes(player.id);
              const peerInfo = voiceUsers[player.id];
              const isMe = player.id === currentUserId;
              const isSpeaking = isMe ? isLocalSpeaking : false; // WebRTC remote speaking indicator can also trigger
              const isPeerMuted = isMe ? isMuted : peerInfo?.isMuted;

              if (!inVoice) return null;

              return (
                <div
                  key={player.id}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs transition-all ${
                    isSpeaking
                      ? 'bg-emerald-950/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                  title={`${player.name} (${inVoice ? 'In voice' : 'Not in voice'})`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      COLOR_BORDER_MAP[player.color].replace('border-', 'bg-')
                    }`}
                  />
                  <span className="font-semibold text-[11px] truncate max-w-[80px]">
                    {player.name}
                  </span>
                  {isPeerMuted ? (
                    <MicOff className="w-3 h-3 text-red-400" />
                  ) : (
                    <Mic className={`w-3 h-3 ${isSpeaking ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                  )}
                </div>
              );
            })}

            {activeVoiceUserIds.length === 0 && (
              <span className="text-xs text-slate-500 italic">No one in voice</span>
            )}
          </div>
        </div>

        {/* Right: Voice Controls */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              {/* Mute Button */}
              <button
                onClick={() => {
                  audio.playClick();
                  onToggleMute();
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-red-950/80 border-red-800 text-red-400 hover:bg-red-900/60'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              </button>

              {/* Deafen Button */}
              <button
                onClick={() => {
                  audio.playClick();
                  onToggleDeafen();
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isDeafened
                    ? 'bg-red-950/80 border-red-800 text-red-400 hover:bg-red-900/60'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title={isDeafened ? 'Undeafen Audio' : 'Deafen Audio'}
              >
                {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
              </button>

              {/* Leave Voice */}
              <button
                onClick={() => {
                  audio.playClick();
                  onLeaveVoice();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <button
              disabled={voiceState === 'connecting'}
              onClick={() => {
                audio.playClick();
                onJoinVoice();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{voiceState === 'connecting' ? 'Connecting...' : 'Join Voice Chat'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Voice Error Notification */}
      {voiceError && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex items-center gap-2 text-xs text-amber-400 bg-amber-950/30 px-3 py-1.5 rounded-xl">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{voiceError}</span>
        </div>
      )}
    </div>
  );
};
