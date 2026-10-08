import React, { useState } from 'react';
import { DhayamPieceType, LudoAvatarType, LudoCustomRules, Player, PlayerColor, RoomState } from '../types/game';
import { Copy, Share2, Check, Lock, Unlock, UserX, Crown, Shield, Play, Sliders } from 'lucide-react';
import { audio } from '../utils/audio';
import { RuleCustomizer } from './RuleCustomizer';

interface LobbyViewProps {
  room: RoomState;
  currentUserId: string;
  onToggleReady: (ready: boolean) => void;
  onChangeDhayamPiece: (piece: DhayamPieceType) => void;
  onChangeLudoAvatar: (avatar: LudoAvatarType) => void;
  onStartGame: () => void;
  onLockRoom: () => void;
  onRemovePlayer: (playerId: string) => void;
  onLeaveRoom: () => void;
  onUpdateRules?: (rules: LudoCustomRules) => void;
}

const COLOR_CLASSES: Record<PlayerColor, { bg: string; border: string; text: string; dot: string }> = {
  red: { bg: 'bg-red-950/40', border: 'border-red-600/40', text: 'text-red-400', dot: 'bg-red-500' },
  green: { bg: 'bg-emerald-950/40', border: 'border-emerald-600/40', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  yellow: { bg: 'bg-amber-950/40', border: 'border-amber-600/40', text: 'text-amber-400', dot: 'bg-amber-500' },
  blue: { bg: 'bg-blue-950/40', border: 'border-blue-600/40', text: 'text-blue-400', dot: 'bg-blue-500' },
};

const PIECE_ICONS: Record<string, string> = {
  sticks: '🥢 Sticks',
  pebbles: '🪨 Pebbles',
  shells: '🐚 Shells',
  tamarind_seeds: '🌰 Tamarind Seeds',
  crown: '👑 Crown',
  star: '⭐ Star',
  shield: '🛡️ Shield',
  gem: '💎 Gem',
};

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  currentUserId,
  onToggleReady,
  onChangeDhayamPiece,
  onChangeLudoAvatar,
  onStartGame,
  onLockRoom,
  onRemovePlayer,
  onLeaveRoom,
  onUpdateRules,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRuleEditor, setShowRuleEditor] = useState(false);

  const me = room.players.find(p => p.id === currentUserId);
  const isHost = me?.isHost ?? false;

  const readyCount = room.players.filter(p => p.isReady).length;
  const canStart = room.players.length >= 2 && room.players.every(p => p.isReady);

  const copyCode = () => {
    audio.playClick();
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = () => {
    audio.playClick();
    if (navigator.share) {
      navigator.share({
        title: 'Join my Dhaalu Winz Match!',
        text: `Join my ${room.boardType.replace('_', ' ').toUpperCase()} match on Dhaalu Winz using team code: ${room.roomCode}`,
        url: window.location.href,
      }).catch(() => copyCode());
    } else {
      copyCode();
    }
  };

  const getBoardTitle = () => {
    if (room.boardType === 'dhayam') return 'Dhayam';
    if (room.boardType === 'classic_ludo') return 'Classic Ludo';
    return 'Modern Ludo';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                TEAM LOBBY
              </span>
              {room.isLocked && (
                <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800/60 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                  <Lock className="w-2.5 h-2.5" /> LOCKED
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {getBoardTitle()}
            </h1>
          </div>

          {/* Team Code Display */}
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">
                TEAM CODE:
              </div>
              <div className="text-lg font-mono font-bold tracking-wider text-amber-400">
                {room.roomCode}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={copyCode}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY CODE'}</span>
              </button>
              <button
                onClick={shareCode}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Share code"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Room Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block mb-1">Board:</span>
            <span className="font-semibold text-slate-200">{getBoardTitle()}</span>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block mb-1">Players:</span>
            <span className="font-semibold text-slate-200">{room.players.length} / {room.maxPlayers}</span>
          </div>

          {room.boardType === 'classic_ludo' ? (
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block mb-1">Custom Rules:</span>
                <span className="font-semibold text-slate-200">
                  Base: {room.rules.entryRoll || '1'} · Win: {room.rules.piecesToWin || 4}P
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setShowRuleEditor(!showRuleEditor);
                }}
                className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-500/40 flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3 h-3" />
                <span>{showRuleEditor ? 'Close Rules' : isHost ? 'Edit Rules' : 'View Rules'}</span>
              </button>
            </div>
          ) : room.boardType === 'modern_ludo' ? (
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block mb-1">Rules:</span>
              <span className="font-semibold text-emerald-400 text-xs">
                Standard Modern (All Selected)
              </span>
            </div>
          ) : (
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block mb-1">Rules:</span>
              <span className="font-semibold text-amber-400 text-xs">
                Authentic Dhayam
              </span>
            </div>
          )}

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 block mb-1">Ready Status:</span>
            <span className="font-bold text-amber-400">
              READY: {readyCount}/{room.players.length}
            </span>
          </div>
        </div>
      </div>

      {/* Rule Customizer in Lobby (Classic Ludo Only) */}
      {showRuleEditor && room.boardType === 'classic_ludo' && (
        <div className="mb-6 animate-in fade-in duration-200">
          <RuleCustomizer
            rules={room.rules}
            onChange={updated => {
              if (isHost && onUpdateRules) {
                onUpdateRules(updated);
              }
            }}
            disabled={!isHost}
          />
        </div>
      )}

      {/* Players List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4 flex items-center justify-between">
          <span>Players in Room</span>
          <span className="text-xs font-normal text-slate-400">
            {room.players.length} of {room.maxPlayers} joined
          </span>
        </h2>

        <div className="space-y-3 mb-6">
          {room.players.map(player => {
            const colorMeta = COLOR_CLASSES[player.color];
            const isMe = player.id === currentUserId;

            return (
              <div
                key={player.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  colorMeta.bg
                } ${colorMeta.border}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${colorMeta.dot} shrink-0`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {player.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] text-amber-400 bg-amber-950 px-1.5 py-0.2 rounded font-mono">
                          YOU
                        </span>
                      )}
                      {player.isHost && (
                        <span className="text-[10px] text-amber-300 bg-amber-900/60 border border-amber-600/40 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" /> HOST
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{player.color} Player</span>
                      <span>·</span>
                      <span>
                        Piece: {PIECE_ICONS[player.dhayamPiece || player.ludoAvatar || 'crown']}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {player.isReady ? (
                    <span className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> READY
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-semibold">
                      NOT READY
                    </span>
                  )}

                  {isHost && !player.isHost && (
                    <button
                      onClick={() => {
                        audio.playClick();
                        onRemovePlayer(player.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Kick player"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty player slots */}
          {Array.from({ length: room.maxPlayers - room.players.length }).map((_, idx) => (
            <div
              key={`empty_${idx}`}
              className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/30 flex items-center justify-between text-xs text-slate-500"
            >
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-800" />
                <span>Waiting for player to join...</span>
              </div>
              <span className="font-mono text-[11px] text-slate-600">
                Share code {room.roomCode}
              </span>
            </div>
          ))}
        </div>

        {/* Piece Selection for Current Player */}
        {me && (
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 mb-6">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              Select Your Piece
            </span>
            {room.boardType === 'dhayam' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'sticks' as DhayamPieceType, name: 'Sticks', icon: '🥢' },
                  { id: 'pebbles' as DhayamPieceType, name: 'Pebbles', icon: '🪨' },
                  { id: 'shells' as DhayamPieceType, name: 'Shells', icon: '🐚' },
                  { id: 'tamarind_seeds' as DhayamPieceType, name: 'Seeds', icon: '🌰' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      audio.playClick();
                      onChangeDhayamPiece(p.id);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      me.dhayamPiece === p.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'crown' as LudoAvatarType, name: 'Crown', icon: '👑' },
                  { id: 'star' as LudoAvatarType, name: 'Star', icon: '⭐' },
                  { id: 'shield' as LudoAvatarType, name: 'Shield', icon: '🛡️' },
                  { id: 'gem' as LudoAvatarType, name: 'Gem', icon: '💎' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      audio.playClick();
                      onChangeLudoAvatar(p.id);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      me.ludoAvatar === p.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lobby Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audio.playClick();
                onLeaveRoom();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Leave Room
            </button>

            {isHost && (
              <button
                onClick={() => {
                  audio.playClick();
                  onLockRoom();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {room.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{room.isLocked ? 'Unlock Room' : 'Lock Room'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {me && (
              <button
                onClick={() => {
                  audio.playClick();
                  onToggleReady(!me.isReady);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  me.isReady
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                }`}
              >
                {me.isReady ? 'CANCEL READY' : 'READY UP'}
              </button>
            )}

            {isHost && (
              <button
                onClick={() => {
                  audio.playClick();
                  onStartGame();
                }}
                disabled={!canStart}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  canStart
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                START GAME
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
