import React, { useState, useEffect, useRef } from 'react';
import {
  BoardType,
  ChatMessage,
  DhayamPieceType,
  LudoAvatarType,
  LudoCustomRules,
  PieceState,
  Player,
  PlayerColor,
  RoomState,
} from './types/game';
import { auth, GoogleUser } from './utils/auth';
import { audio } from './utils/audio';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { GoogleSignInModal } from './components/GoogleSignInModal';
import { PlayerNameModal } from './components/PlayerNameModal';
import { CreateTeamModal } from './components/CreateTeamModal';
import { JoinTeamModal } from './components/JoinTeamModal';
import { LobbyView } from './components/LobbyView';
import { DhayamBoard } from './components/DhayamBoard';
import { ClassicLudoBoard } from './components/ClassicLudoBoard';
import { ModernLudoBoard } from './components/ModernLudoBoard';
import { VictoryModal } from './components/VictoryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { ProfileModal } from './components/ProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { OfflineGameSetupModal } from './components/OfflineGameSetupModal';
import { VoiceBar } from './components/VoiceBar';
import { ChatDrawer } from './components/ChatDrawer';
import { voice, VoiceState } from './utils/voiceManager';
import {
  rollDhayamDice,
  getDhayamValidMoves,
  getDhayamPathForColor,
  DHAYAM_SAFE_COORDINATES,
} from './utils/dhayamEngine';
import {
  rollLudoDice,
  getLudoValidMoves,
  getLudoTrackPosition,
  LUDO_SAFE_POSITIONS,
  TOTAL_STEPS_TO_FINISH,
} from './utils/ludoEngine';
import { ArrowLeft } from 'lucide-react';

const PLAYER_COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

export default function App() {
  // Authentication & Profile state
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(auth.getGoogleUser());
  const [profile, setProfile] = useState(auth.getProfile());
  const [playerName, setPlayerName] = useState(auth.getPlayerName());

  // Navigation / Modal States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginReason, setLoginReason] = useState<'create_team' | 'join_team' | 'general'>('general');
  const [pendingActionAfterLogin, setPendingActionAfterLogin] = useState<'create_team' | 'join_team' | null>(null);

  const [showPlayerNameModal, setShowPlayerNameModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineBoard, setOfflineBoard] = useState<BoardType>('classic_ludo');
  const [createTeamBoard, setCreateTeamBoard] = useState<BoardType>('classic_ludo');

  // Room & Game State (for both online and offline)
  const [activeRoom, setActiveRoom] = useState<RoomState | null>(null);
  const [isOfflineGame, setIsOfflineGame] = useState(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const lastMsgCountRef = useRef(0);

  // Voice State
  const [voiceState, setVoiceState] = useState<VoiceState>('disconnected');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isAudioDeafened, setIsAudioDeafened] = useState(false);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // Configure VoiceManager callbacks
  useEffect(() => {
    voice.setCallbacks({
      onStateChange: (state, err) => {
        setVoiceState(state);
        setVoiceError(err || null);
      },
      onSpeakingChange: (isSpeaking) => {
        setIsLocalSpeaking(isSpeaking);
      },
      sendSignal: (targetPlayerId, signal) => {
        sendWs({
          type: 'voice_signal',
          targetPlayerId,
          signal,
        });
      },
    });

    return () => {
      voice.leaveVoice();
    };
  }, []);

  // Track unread chat messages when chat is closed
  useEffect(() => {
    if (activeRoom?.chatMessages) {
      const currentCount = activeRoom.chatMessages.length;
      if (!isChatOpen && currentCount > lastMsgCountRef.current) {
        setUnreadChatCount(prev => prev + (currentCount - lastMsgCountRef.current));
      }
      lastMsgCountRef.current = currentCount;
    }
  }, [activeRoom?.chatMessages, isChatOpen]);

  // Reset unread count when chat is opened
  const handleToggleChatOpen = () => {
    setIsChatOpen(prev => {
      const next = !prev;
      if (next) {
        setUnreadChatCount(0);
      }
      return next;
    });
  };

  // Subscribe to Auth changes
  useEffect(() => {
    const unsub = auth.subscribe(() => {
      setGoogleUser(auth.getGoogleUser());
      const p = auth.getProfile();
      setProfile(p);
      setPlayerName(auth.getPlayerName());
    });
    return unsub;
  }, []);

  // Initialize WebSocket connection for online multiplayer
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'room_created') {
            setActiveRoom(data.room);
            setIsOfflineGame(false);
            setShowCreateTeamModal(false);
          } else if (data.type === 'room_state') {
            setActiveRoom(data.state);
            setIsOfflineGame(false);
            setShowJoinTeamModal(false);
            setJoinError(null);
          } else if (data.type === 'voice_peer_joined') {
            voice.handlePeerJoined(data.peerId);
          } else if (data.type === 'voice_peer_left') {
            voice.handlePeerLeft(data.peerId);
          } else if (data.type === 'voice_signal') {
            voice.handleSignal(data.fromPlayerId, data.signal);
          } else if (data.type === 'error') {
            setJoinError(data.message);
          }
        } catch {
          // Ignored
        }
      };

      ws.onclose = () => {
        // Will reconnect if needed
      };
    } catch {
      // Ignored
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Guest clicks CREATE TEAM
  const handleCreateTeamClick = (board?: BoardType) => {
    if (board) {
      setCreateTeamBoard(board);
    }
    if (!auth.isLoggedIn()) {
      setLoginReason('create_team');
      setPendingActionAfterLogin('create_team');
      setShowLoginModal(true);
      return;
    }
    // Check if player name needs setup
    if (!profile?.displayName) {
      setShowPlayerNameModal(true);
      return;
    }
    setShowCreateTeamModal(true);
  };

  const handlePlayOfflineClick = (board?: BoardType) => {
    if (board) {
      setOfflineBoard(board);
    }
    setShowOfflineModal(true);
  };

  // Guest clicks JOIN TEAM
  const handleJoinTeamClick = () => {
    if (!auth.isLoggedIn()) {
      setLoginReason('join_team');
      setPendingActionAfterLogin('join_team');
      setShowLoginModal(true);
      return;
    }
    if (!profile?.displayName) {
      setShowPlayerNameModal(true);
      return;
    }
    setJoinError(null);
    setShowJoinTeamModal(true);
  };

  // When Google Sign-In completes successfully
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    const updatedProfile = auth.getProfile();

    if (!updatedProfile?.displayName) {
      setShowPlayerNameModal(true);
    } else {
      resumePendingAction();
    }
  };

  const handlePlayerNameChosen = () => {
    setShowPlayerNameModal(false);
    resumePendingAction();
  };

  const resumePendingAction = () => {
    if (pendingActionAfterLogin === 'create_team') {
      setShowCreateTeamModal(true);
    } else if (pendingActionAfterLogin === 'join_team') {
      setJoinError(null);
      setShowJoinTeamModal(true);
    }
    setPendingActionAfterLogin(null);
  };

  // Send action via WebSocket
  const sendWs = (payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  // Host creates online team
  const handleCreateOnlineRoom = (params: {
    playerName: string;
    boardType: BoardType;
    maxPlayers: number;
    isPrivate: boolean;
    rules: LudoCustomRules;
    pieceType?: DhayamPieceType;
    avatarType?: LudoAvatarType;
  }) => {
    const currentId = googleUser?.id || 'guest_' + Date.now();
    sendWs({
      type: 'create_room',
      playerId: currentId,
      ...params,
    });
  };

  // Join online room
  const handleJoinOnlineRoom = (code: string) => {
    const currentId = googleUser?.id || 'guest_' + Date.now();
    sendWs({
      type: 'join_room',
      roomCode: code,
      playerId: currentId,
      playerName: playerName || 'Player',
    });
  };

  // Lobby actions
  const handleToggleReady = (ready: boolean) => {
    if (isOfflineGame) return;
    sendWs({ type: 'update_player', isReady: ready });
  };

  const handleChangeDhayamPiece = (piece: DhayamPieceType) => {
    if (isOfflineGame) return;
    sendWs({ type: 'update_player', dhayamPiece: piece });
  };

  const handleChangeLudoAvatar = (avatar: LudoAvatarType) => {
    if (isOfflineGame) return;
    sendWs({ type: 'update_player', ludoAvatar: avatar });
  };

  const handleStartGame = () => {
    if (isOfflineGame) return;
    sendWs({ type: 'start_game' });
  };

  const handleLockRoom = () => {
    if (isOfflineGame) return;
    sendWs({ type: 'host_lock_room' });
  };

  const handleRemovePlayer = (targetId: string) => {
    if (isOfflineGame) return;
    sendWs({ type: 'host_remove_player', targetPlayerId: targetId });
  };

  const handleUpdateRules = (updatedRules: LudoCustomRules) => {
    if (isOfflineGame) {
      if (activeRoom) {
        setActiveRoom({ ...activeRoom, rules: updatedRules });
      }
    } else {
      sendWs({ type: 'host_update_settings', rules: updatedRules });
    }
  };

  const handleLeaveRoom = () => {
    audio.playClick();
    voice.leaveVoice();
    sendWs({ type: 'voice_leave' });
    setActiveRoom(null);
    setIsOfflineGame(false);
  };

  // Voice Action Handlers
  const handleJoinVoice = async () => {
    const ok = await voice.joinVoice(currentUserId);
    if (ok) {
      sendWs({
        type: 'voice_join',
        isMuted: voice.getMuted(),
      });
    }
  };

  const handleLeaveVoice = () => {
    voice.leaveVoice();
    sendWs({ type: 'voice_leave' });
  };

  const handleToggleVoiceMute = () => {
    const next = !voice.getMuted();
    voice.setMuted(next);
    setIsMicMuted(next);
    sendWs({
      type: 'voice_toggle_mute',
      isMuted: next,
    });
  };

  const handleToggleVoiceDeafen = () => {
    const next = !voice.getDeafened();
    voice.setDeafened(next);
    setIsAudioDeafened(next);
  };

  // Chat Action Handler
  const handleSendMessage = (text: string, isQuickReaction?: boolean) => {
    if (!isOfflineGame) {
      sendWs({
        type: 'send_chat',
        text,
        isQuickReaction,
      });
    } else if (activeRoom) {
      // Offline local match chat
      const currentTurnPlayer = activeRoom.players[activeRoom.turnPlayerIndex];
      const newMsg: ChatMessage = {
        id: 'local_msg_' + Date.now(),
        senderId: currentTurnPlayer.id,
        senderName: currentTurnPlayer.name,
        senderColor: currentTurnPlayer.color,
        text: text.slice(0, 160),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isQuickReaction,
      };
      const msgs = [...(activeRoom.chatMessages || []), newMsg];
      setActiveRoom({
        ...activeRoom,
        chatMessages: msgs.slice(-80),
      });
    }
  };

  // In-Game Dice Roll
  const handleRollDice = () => {
    if (!activeRoom) return;

    if (!isOfflineGame) {
      sendWs({ type: 'roll_dice' });
      return;
    }

    // OFFLINE PASS & PLAY DICE LOGIC
    const room = { ...activeRoom };
    const currentTurnPlayer = room.players[room.turnPlayerIndex];
    if (room.diceRolled || room.isFinished) return;

    room.diceRolled = true;

    if (room.boardType === 'dhayam') {
      const dice = rollDhayamDice();
      room.dhayamDice = dice;
      const validMoves = getDhayamValidMoves(room.pieces, currentTurnPlayer.id, dice);
      room.validMoves = validMoves;

      if (validMoves.length === 0) {
        room.statusMessage = `${currentTurnPlayer.name} rolled ${dice.total}. No moves possible.`;
        if (dice.extraTurn) {
          room.statusMessage += ' Extra turn granted! Roll again.';
          room.diceRolled = false;
        } else {
          room.turnPlayerIndex = (room.turnPlayerIndex + 1) % room.players.length;
          room.diceRolled = false;
          const next = room.players[room.turnPlayerIndex];
          room.statusMessage += ` Next is ${next.name}'s turn.`;
        }
      } else {
        room.statusMessage = `${currentTurnPlayer.name} rolled ${dice.total}${
          dice.isDhayam ? ' (DHAYAM!)' : ''
        }. Select a piece to move.`;
      }
    } else {
      const dice = rollLudoDice(room.rules);
      room.ludoDice = dice;
      const playerCaptures = room.playerCaptures?.[currentTurnPlayer.id] || 0;
      const validMoves = getLudoValidMoves(
        room.pieces,
        currentTurnPlayer.id,
        currentTurnPlayer.color,
        dice.value,
        room.rules,
        playerCaptures
      );
      room.validMoves = validMoves;

      if (validMoves.length === 0) {
        room.statusMessage = `${currentTurnPlayer.name} rolled a ${dice.value}. No moves possible.`;
        if (dice.extraTurn) {
          room.statusMessage += ` Rolled ${dice.value} -> Extra turn! Roll again.`;
          room.diceRolled = false;
        } else {
          room.turnPlayerIndex = (room.turnPlayerIndex + 1) % room.players.length;
          room.diceRolled = false;
          const next = room.players[room.turnPlayerIndex];
          room.statusMessage += ` Next is ${next.name}'s turn.`;
        }
      } else {
        room.statusMessage = `${currentTurnPlayer.name} rolled a ${dice.value}. Select a piece to move.`;
      }
    }

    setActiveRoom({ ...room });
  };

  // In-Game Piece Move
  const handleMovePiece = (pieceId: number) => {
    if (!activeRoom) return;

    if (!isOfflineGame) {
      sendWs({ type: 'move_piece', pieceId });
      return;
    }

    // OFFLINE PASS & PLAY PIECE MOVE LOGIC
    const room = { ...activeRoom };
    const currentTurnPlayer = room.players[room.turnPlayerIndex];
    const piece = room.pieces.find(p => p.playerId === currentTurnPlayer.id && p.id === pieceId);
    if (!piece) return;

    let captured = false;
    let extraTurn = false;

    if (room.boardType === 'dhayam') {
      const dice = room.dhayamDice!;
      extraTurn = dice.extraTurn;

      if (piece.step === -1) {
        piece.step = 0;
        room.statusMessage = `${currentTurnPlayer.name} entered piece ${piece.id + 1} into play!`;
      } else {
        piece.step += dice.total;
        if (piece.step >= 40) {
          piece.step = 40;
          piece.isFinished = true;
          room.statusMessage = `${currentTurnPlayer.name}'s piece reached the Pazham (Center Fruit)!`;
        } else {
          room.statusMessage = `${currentTurnPlayer.name} moved piece ${piece.id + 1}.`;
        }
      }

      // Check capture
      if (!piece.isFinished && piece.step >= 0) {
        const myPath = getDhayamPathForColor(piece.playerColor);
        const myCoord = myPath[piece.step];
        const isSafe = DHAYAM_SAFE_COORDINATES.has(`${myCoord.x},${myCoord.y}`);

        if (!isSafe) {
          for (const opp of room.pieces) {
            if (opp.playerId !== currentTurnPlayer.id && !opp.isFinished && opp.step >= 0) {
              const oppPath = getDhayamPathForColor(opp.playerColor);
              const oppCoord = oppPath[opp.step];
              if (oppCoord.x === myCoord.x && oppCoord.y === myCoord.y) {
                opp.step = -1;
                captured = true;
                extraTurn = true;
                audio.playCapture();
                const oppOwner = room.players.find(p => p.id === opp.playerId);
                room.statusMessage = `💥 ${currentTurnPlayer.name} captured ${oppOwner?.name}'s piece! Extra roll awarded!`;
                break;
              }
            }
          }
        }
      }

      // Check victory
      const playerPieces = room.pieces.filter(p => p.playerId === currentTurnPlayer.id);
      if (playerPieces.every(p => p.isFinished)) {
        room.isFinished = true;
        room.winnerPlayerId = currentTurnPlayer.id;
        room.winnerName = currentTurnPlayer.name;
        room.statusMessage = `🏆 ${currentTurnPlayer.name} won the Dhayam match!`;
        auth.recordGameResult({
          boardType: 'dhayam',
          won: true,
          captures: captured ? 1 : 0,
          playersCount: room.players.length,
        });
      }
    } else {
      // Classic or Modern Ludo
      const dice = room.ludoDice!;
      extraTurn = dice.extraTurn;

      if (piece.step === -1) {
        piece.step = 0;
        room.statusMessage = `${currentTurnPlayer.name} brought piece ${piece.id + 1} out of base!`;
      } else {
        piece.step += dice.value;
        if (piece.step >= TOTAL_STEPS_TO_FINISH) {
          piece.step = TOTAL_STEPS_TO_FINISH;
          piece.isFinished = true;
          room.statusMessage = `${currentTurnPlayer.name}'s piece reached Home!`;
        } else {
          room.statusMessage = `${currentTurnPlayer.name} moved piece ${piece.id + 1} by ${dice.value}.`;
        }
      }

      // Check capture in Ludo
      if (!piece.isFinished && piece.step >= 0 && piece.step <= 50) {
        const myPos = getLudoTrackPosition(piece.playerColor, piece.step);
        const isSafe = room.rules.safeZones && LUDO_SAFE_POSITIONS.has(myPos.index);

        if (!isSafe) {
          const oppsOnSquare = room.pieces.filter(
            p =>
              p.playerId !== currentTurnPlayer.id &&
              !p.isFinished &&
              p.step >= 0 &&
              p.step <= 50 &&
              getLudoTrackPosition(p.playerColor, p.step).index === myPos.index
          );

          if (oppsOnSquare.length === 1) {
            const victim = oppsOnSquare[0];
            victim.step = -1;
            captured = true;
            if (!room.playerCaptures) room.playerCaptures = {};
            room.playerCaptures[currentTurnPlayer.id] = (room.playerCaptures[currentTurnPlayer.id] || 0) + 1;

            audio.playCapture();
            if (room.rules.extraTurnOnCapture) {
              extraTurn = true;
            }
            const victimOwner = room.players.find(p => p.id === victim.playerId);
            room.statusMessage = `💥 ${currentTurnPlayer.name} captured ${victimOwner?.name}'s piece!`;
            if (extraTurn) {
              room.statusMessage += ' Extra turn granted!';
            }
          }
        }
      }

      // Check victory: Reached required piecesToWin (default 4)
      const playerPieces = room.pieces.filter(p => p.playerId === currentTurnPlayer.id);
      const finishedPiecesCount = playerPieces.filter(p => p.isFinished).length;
      const targetPiecesToWin = room.rules.piecesToWin || 4;

      if (finishedPiecesCount >= targetPiecesToWin) {
        room.isFinished = true;
        room.winnerPlayerId = currentTurnPlayer.id;
        room.winnerName = currentTurnPlayer.name;
        room.statusMessage = `🏆 ${currentTurnPlayer.name} has completed ${finishedPiecesCount} piece(s) and won!`;
        auth.recordGameResult({
          boardType: room.boardType,
          won: true,
          captures: captured ? 1 : 0,
          playersCount: room.players.length,
        });
      }
    }

    room.validMoves = [];

    if (!room.isFinished) {
      if (extraTurn) {
        room.diceRolled = false;
        room.statusMessage += ' Roll again!';
        audio.playExtraTurn();
      } else {
        room.turnPlayerIndex = (room.turnPlayerIndex + 1) % room.players.length;
        room.diceRolled = false;
        const next = room.players[room.turnPlayerIndex];
        room.statusMessage += ` Next is ${next.name}'s turn.`;
      }
    }

    setActiveRoom({ ...room });
  };

  // Rematch
  const handleRematch = () => {
    if (!activeRoom) return;
    if (!isOfflineGame) {
      sendWs({ type: 'rematch' });
      return;
    }

    // Offline rematch
    const pieces: PieceState[] = [];
    activeRoom.players.forEach(p => {
      for (let i = 0; i < 4; i++) {
        pieces.push({
          id: i,
          playerId: p.id,
          playerColor: p.color,
          step: -1,
          isFinished: false,
        });
      }
    });

    const turnPlayerIndex = Math.floor(Math.random() * activeRoom.players.length);
    const firstPlayer = activeRoom.players[turnPlayerIndex];

    setActiveRoom({
      ...activeRoom,
      isFinished: false,
      winnerPlayerId: null,
      winnerName: null,
      pieces,
      turnPlayerIndex,
      diceRolled: false,
      dhayamDice: null,
      ludoDice: null,
      validMoves: [],
      statusMessage: `Rematch started! ${firstPlayer.name}'s turn (${firstPlayer.color.toUpperCase()}). Roll the dice!`,
    });
  };

  // Start Offline Pass & Play Game
  const handleStartOfflineGame = (config: {
    boardType: BoardType;
    playerCount: number;
    playerNames: string[];
    rules: LudoCustomRules;
    dhayamPieces?: DhayamPieceType[];
    ludoAvatars?: LudoAvatarType[];
  }) => {
    const players: Player[] = config.playerNames.map((name, idx) => ({
      id: `local_p_${idx}`,
      name: name || `Player ${idx + 1}`,
      color: PLAYER_COLORS[idx % 4],
      isHost: idx === 0,
      isReady: true,
      dhayamPiece: config.dhayamPieces ? config.dhayamPieces[idx] : 'sticks',
      ludoAvatar: config.ludoAvatars ? config.ludoAvatars[idx] : 'crown',
      isConnected: true,
    }));

    const pieces: PieceState[] = [];
    players.forEach(p => {
      for (let id = 0; id < 4; id++) {
        pieces.push({
          id,
          playerId: p.id,
          playerColor: p.color,
          step: -1,
          isFinished: false,
        });
      }
    });

    const turnPlayerIndex = 0;
    const firstPlayer = players[turnPlayerIndex];

    const newOfflineRoom: RoomState = {
      roomId: 'offline_' + Date.now(),
      roomCode: 'LOCAL',
      boardType: config.boardType,
      maxPlayers: config.playerCount,
      isPrivate: true,
      isLocked: false,
      isStarted: true,
      isFinished: false,
      winnerPlayerId: null,
      winnerName: null,
      hostId: players[0].id,
      players,
      rules: config.rules,
      turnPlayerIndex,
      diceRolled: false,
      dhayamDice: null,
      ludoDice: null,
      pieces,
      validMoves: [],
      statusMessage: `Match started! ${firstPlayer.name}'s turn (${firstPlayer.color.toUpperCase()}). Roll the dice!`,
      chatMessages: [],
      voiceUsers: {},
    };

    setActiveRoom(newOfflineRoom);
    setIsOfflineGame(true);
    setShowOfflineModal(false);
  };

  // Quick offline board selection from dashboard cards
  const handleSelectBoardOffline = (board: BoardType) => {
    setOfflineBoard(board);
    setShowOfflineModal(true);
  };

  const currentUserId = isOfflineGame
    ? activeRoom?.players[activeRoom.turnPlayerIndex]?.id || 'local'
    : googleUser?.id || '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        onOpenOffline={() => {
          setOfflineBoard('classic_ludo');
          setShowOfflineModal(true);
        }}
        onOpenHowToPlay={() => setShowHowToPlayModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenLogin={() => {
          setLoginReason('general');
          setPendingActionAfterLogin(null);
          setShowLoginModal(true);
        }}
        user={googleUser}
        playerName={playerName}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {!activeRoom ? (
          // Main Dashboard
          <Dashboard
            isLoggedIn={auth.isLoggedIn()}
            playerName={playerName}
            onCreateTeamClick={handleCreateTeamClick}
            onJoinTeamClick={handleJoinTeamClick}
            onPlayOfflineClick={handlePlayOfflineClick}
            onHowToPlayClick={() => setShowHowToPlayModal(true)}
            onSettingsClick={() => setShowSettingsModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onGameHistoryClick={() => setShowProfileModal(true)}
          />
        ) : !activeRoom.isStarted ? (
          // Team Lobby View
          <div className="w-full flex-1 flex flex-col items-center">
            {!isOfflineGame && (
              <div className="w-full max-w-4xl mx-auto px-4 pt-4">
                <VoiceBar
                  room={activeRoom}
                  currentUserId={currentUserId}
                  voiceState={voiceState}
                  isMuted={isMicMuted}
                  isDeafened={isAudioDeafened}
                  isLocalSpeaking={isLocalSpeaking}
                  voiceError={voiceError}
                  onJoinVoice={handleJoinVoice}
                  onLeaveVoice={handleLeaveVoice}
                  onToggleMute={handleToggleVoiceMute}
                  onToggleDeafen={handleToggleVoiceDeafen}
                />
              </div>
            )}
            <LobbyView
              room={activeRoom}
              currentUserId={currentUserId}
              onToggleReady={handleToggleReady}
              onChangeDhayamPiece={handleChangeDhayamPiece}
              onChangeLudoAvatar={handleChangeLudoAvatar}
              onStartGame={handleStartGame}
              onLockRoom={handleLockRoom}
              onRemovePlayer={handleRemovePlayer}
              onLeaveRoom={handleLeaveRoom}
              onUpdateRules={handleUpdateRules}
            />
          </div>
        ) : (
          // Active Game Screen
          <div className="w-full flex-1 flex flex-col items-center">
            {/* Quick in-game return affordance & Voice Bar */}
            <div className="w-full max-w-5xl mx-auto px-4 pt-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleLeaveRoom}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit Match</span>
                </button>

                {isOfflineGame && (
                  <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                    OFFLINE PASS & PLAY
                  </span>
                )}
              </div>

              {!isOfflineGame && (
                <VoiceBar
                  room={activeRoom}
                  currentUserId={currentUserId}
                  voiceState={voiceState}
                  isMuted={isMicMuted}
                  isDeafened={isAudioDeafened}
                  isLocalSpeaking={isLocalSpeaking}
                  voiceError={voiceError}
                  onJoinVoice={handleJoinVoice}
                  onLeaveVoice={handleLeaveVoice}
                  onToggleMute={handleToggleVoiceMute}
                  onToggleDeafen={handleToggleVoiceDeafen}
                />
              )}
            </div>

            {/* Board Router based on selected BoardType */}
            {activeRoom.boardType === 'dhayam' && (
              <DhayamBoard
                room={activeRoom}
                currentUserId={currentUserId}
                onRollDice={handleRollDice}
                onMovePiece={handleMovePiece}
                isOfflineMode={isOfflineGame}
              />
            )}

            {activeRoom.boardType === 'classic_ludo' && (
              <ClassicLudoBoard
                room={activeRoom}
                currentUserId={currentUserId}
                onRollDice={handleRollDice}
                onMovePiece={handleMovePiece}
                isOfflineMode={isOfflineGame}
              />
            )}

            {activeRoom.boardType === 'modern_ludo' && (
              <ModernLudoBoard
                room={activeRoom}
                currentUserId={currentUserId}
                onRollDice={handleRollDice}
                onMovePiece={handleMovePiece}
                isOfflineMode={isOfflineGame}
              />
            )}
          </div>
        )}
      </main>

      {/* Real-time Match Chat Drawer */}
      {activeRoom && (
        <ChatDrawer
          messages={activeRoom.chatMessages || []}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          isOpen={isChatOpen}
          onToggleOpen={handleToggleChatOpen}
          unreadCount={unreadChatCount}
        />
      )}

      {/* Modals & Dialogs */}
      <GoogleSignInModal
        isOpen={showLoginModal}
        reason={loginReason}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      <PlayerNameModal
        isOpen={showPlayerNameModal}
        onComplete={handlePlayerNameChosen}
      />

      <CreateTeamModal
        isOpen={showCreateTeamModal}
        onClose={() => setShowCreateTeamModal(false)}
        defaultPlayerName={playerName}
        boardType={createTeamBoard}
        onCreateRoom={handleCreateOnlineRoom}
      />

      <JoinTeamModal
        isOpen={showJoinTeamModal}
        onClose={() => {
          setShowJoinTeamModal(false);
          setJoinError(null);
        }}
        onJoinRoom={handleJoinOnlineRoom}
        errorMessage={joinError}
      />

      <OfflineGameSetupModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        boardType={offlineBoard}
        onStartOfflineGame={handleStartOfflineGame}
      />

      <HowToPlayModal
        isOpen={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        googleUser={googleUser}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        playerName={playerName}
      />

      <VictoryModal
        isOpen={Boolean(activeRoom && activeRoom.isFinished)}
        winnerName={activeRoom?.winnerName || 'Winner'}
        boardType={activeRoom?.boardType || 'classic_ludo'}
        onRematch={handleRematch}
        onExit={handleLeaveRoom}
      />
    </div>
  );
}
