import React, { useState } from 'react';
import { LudoAvatarType, PieceState, Player, PlayerColor, RoomState } from '../types/game';
import {
  COLOR_START_POSITIONS,
  getLudoTrackPosition,
  LUDO_BASE_SLOTS,
  LUDO_GRID_COORDINATES,
  LUDO_HOME_COLUMNS,
  LUDO_SAFE_POSITIONS,
  TOTAL_STEPS_TO_FINISH,
} from '../utils/ludoEngine';
import { audio } from '../utils/audio';
import { Zap, Shield, Sparkles, Trophy, Flame } from 'lucide-react';

interface ModernLudoBoardProps {
  room: RoomState;
  currentUserId: string;
  onRollDice: () => void;
  onMovePiece: (pieceId: number) => void;
  isOfflineMode?: boolean;
}

const MODERN_AVATARS: Record<LudoAvatarType, { icon: string; name: string }> = {
  crown: { icon: '👑', name: 'Cyber Crown' },
  star: { icon: '⭐', name: 'Nova Star' },
  shield: { icon: '🛡️', name: 'Aegis Shield' },
  gem: { icon: '💎', name: 'Plasma Gem' },
};

const MODERN_THEMES: Record<PlayerColor, {
  name: string;
  glow: string;
  border: string;
  bg: string;
  text: string;
  fill: string;
}> = {
  red: {
    name: 'Red Sector',
    glow: 'shadow-red-500/50',
    border: 'border-red-500',
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    fill: 'bg-red-500',
  },
  green: {
    name: 'Emerald Sector',
    glow: 'shadow-emerald-500/50',
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    fill: 'bg-emerald-500',
  },
  yellow: {
    name: 'Solar Sector',
    glow: 'shadow-amber-500/50',
    border: 'border-amber-400',
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    fill: 'bg-amber-400',
  },
  blue: {
    name: 'Cobalt Sector',
    glow: 'shadow-cyan-500/50',
    border: 'border-cyan-400',
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    fill: 'bg-cyan-500',
  },
};

export const ModernLudoBoard: React.FC<ModernLudoBoardProps> = ({
  room,
  currentUserId,
  onRollDice,
  onMovePiece,
  isOfflineMode = false,
}) => {
  const [rollingAnim, setRollingAnim] = useState(false);

  const currentTurnPlayer = room.players[room.turnPlayerIndex];
  const isMyTurn = isOfflineMode || currentTurnPlayer?.id === currentUserId;

  const handleRoll = () => {
    if (!isMyTurn || room.diceRolled || room.isFinished) return;
    audio.playDiceRoll();
    setRollingAnim(true);
    setTimeout(() => {
      setRollingAnim(false);
      onRollDice();
    }, 400);
  };

  const handlePieceClick = (pieceId: number) => {
    if (!isMyTurn || !room.diceRolled || room.isFinished) return;
    if (!room.validMoves.includes(pieceId)) return;
    audio.playPieceMove();
    onMovePiece(pieceId);
  };

  const getPiecesOnTrack = (trackIndex: number) => {
    return room.pieces.filter(p => {
      if (p.isFinished || p.step === -1) return false;
      const pos = getLudoTrackPosition(p.playerColor, p.step);
      return pos.type === 'track' && pos.index === trackIndex;
    });
  };

  const getPiecesOnHomeColumn = (color: PlayerColor, colIndex: number) => {
    return room.pieces.filter(p => {
      if (p.isFinished || p.step === -1 || p.playerColor !== color) return false;
      const pos = getLudoTrackPosition(p.playerColor, p.step);
      return pos.type === 'home_column' && pos.index === colIndex;
    });
  };

  const getFinishedPiecesForColor = (color: PlayerColor) => {
    return room.pieces.filter(p => p.playerColor === color && p.isFinished);
  };

  const getBasePieces = (color: PlayerColor) => {
    return room.pieces.filter(p => p.playerColor === color && p.step === -1);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 select-none">
      {/* Modern Neon HUD Bar */}
      <div className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 mb-6 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded-full ${
              MODERN_THEMES[currentTurnPlayer.color].fill
            } animate-ping shadow-lg`}
          />
          <div>
            <div className="text-[11px] uppercase font-mono tracking-widest text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>MODERN LUDO PROTOCOL</span>
            </div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span>{currentTurnPlayer.name}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${MODERN_THEMES[currentTurnPlayer.color].border} ${MODERN_THEMES[currentTurnPlayer.color].text}`}>
                {currentTurnPlayer.color.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-200 text-center sm:text-right max-w-md bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
          {room.statusMessage}
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Modern Player Status Pods */}
        <div className="lg:col-span-3 space-y-3 order-2 lg:order-1">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>PLAYER STATUS PODS</span>
          </div>

          {room.players.map(player => {
            const isTurn = player.id === currentTurnPlayer.id;
            const basePieces = getBasePieces(player.color);
            const finishedPieces = getFinishedPiecesForColor(player.color);
            const avatar = MODERN_AVATARS[player.ludoAvatar || 'crown'];
            const theme = MODERN_THEMES[player.color];

            return (
              <div
                key={player.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isTurn
                    ? `bg-slate-800/90 ${theme.border} shadow-lg ${theme.glow} ring-1 ring-white/20`
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{avatar.icon}</span>
                    <span className="font-bold text-white text-xs truncate max-w-[110px]">
                      {player.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase ${theme.text}`}>
                    {player.color}
                  </span>
                </div>

                {/* Base Pod Slot (1 required to launch) */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                    <span>Base Station (1 to launch):</span>
                    <span className="font-mono">{basePieces.length}/4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {basePieces.map(piece => {
                      const isValid = isMyTurn && isTurn && room.diceRolled && room.validMoves.includes(piece.id);
                      return (
                        <button
                          key={piece.id}
                          disabled={!isValid}
                          onClick={() => handlePieceClick(piece.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all ${
                            theme.fill
                          } text-white shadow-md ${
                            isValid
                              ? 'ring-2 ring-white scale-110 cursor-pointer animate-pulse'
                              : 'opacity-40 cursor-default'
                          }`}
                          title={`Piece ${piece.id + 1} at Base`}
                        >
                          {avatar.icon}
                        </button>
                      );
                    })}
                    {basePieces.length === 0 && (
                      <span className="text-[11px] text-slate-500 italic">All units deployed</span>
                    )}
                  </div>
                </div>

                {/* Finished count */}
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between px-1">
                  <span>Nexus Home Reached:</span>
                  <span className="font-bold text-emerald-400 font-mono">{finishedPieces.length}/4</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: The Modern Futuristic 15x15 Ludo Board */}
        <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
          <div className="relative p-3 rounded-2xl bg-slate-950 shadow-2xl max-w-[480px] w-full aspect-square border-2 border-slate-800">
            {/* 15x15 Modern Grid */}
            <div className="w-full h-full grid grid-cols-15 grid-rows-15 gap-[1px] bg-slate-900/80 rounded-xl overflow-hidden border border-slate-800">
              {/* Corner Quadrant 1: Red Base (Top Left) */}
              <div
                className="bg-slate-900 p-2 flex items-center justify-center border-b border-r border-slate-800 relative"
                style={{ gridColumn: '1 / span 6', gridRow: '1 / span 6' }}
              >
                <div className="w-full h-full bg-slate-950/80 rounded-xl p-2 grid grid-cols-2 grid-rows-2 gap-2 border border-red-500/30 shadow-inner">
                  {[0, 1, 2, 3].map(slotIdx => {
                    const piece = room.pieces.find(p => p.playerColor === 'red' && p.id === slotIdx);
                    const isMovable =
                      isMyTurn &&
                      currentTurnPlayer.color === 'red' &&
                      room.diceRolled &&
                      piece &&
                      piece.step === -1 &&
                      room.validMoves.includes(piece.id);

                    return (
                      <div
                        key={slotIdx}
                        className="bg-red-950/30 rounded-lg flex items-center justify-center border border-red-500/20"
                      >
                        {piece && piece.step === -1 && (
                          <button
                            disabled={!isMovable}
                            onClick={() => piece && handlePieceClick(piece.id)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform ${
                              isMovable ? 'ring-2 ring-white animate-pulse scale-110 cursor-pointer shadow-red-500/60' : 'cursor-default'
                            }`}
                          >
                            {MODERN_AVATARS[room.players.find(p => p.color === 'red')?.ludoAvatar || 'crown'].icon}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Corner Quadrant 2: Green Base (Top Right) */}
              <div
                className="bg-slate-900 p-2 flex items-center justify-center border-b border-l border-slate-800 relative"
                style={{ gridColumn: '10 / span 6', gridRow: '1 / span 6' }}
              >
                <div className="w-full h-full bg-slate-950/80 rounded-xl p-2 grid grid-cols-2 grid-rows-2 gap-2 border border-emerald-500/30 shadow-inner">
                  {[0, 1, 2, 3].map(slotIdx => {
                    const piece = room.pieces.find(p => p.playerColor === 'green' && p.id === slotIdx);
                    const isMovable =
                      isMyTurn &&
                      currentTurnPlayer.color === 'green' &&
                      room.diceRolled &&
                      piece &&
                      piece.step === -1 &&
                      room.validMoves.includes(piece.id);

                    return (
                      <div
                        key={slotIdx}
                        className="bg-emerald-950/30 rounded-lg flex items-center justify-center border border-emerald-500/20"
                      >
                        {piece && piece.step === -1 && (
                          <button
                            disabled={!isMovable}
                            onClick={() => piece && handlePieceClick(piece.id)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-lg transition-transform ${
                              isMovable ? 'ring-2 ring-white animate-pulse scale-110 cursor-pointer shadow-emerald-500/60' : 'cursor-default'
                            }`}
                          >
                            {MODERN_AVATARS[room.players.find(p => p.color === 'green')?.ludoAvatar || 'crown'].icon}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Corner Quadrant 3: Blue Base (Bottom Left) */}
              <div
                className="bg-slate-900 p-2 flex items-center justify-center border-t border-r border-slate-800 relative"
                style={{ gridColumn: '1 / span 6', gridRow: '10 / span 6' }}
              >
                <div className="w-full h-full bg-slate-950/80 rounded-xl p-2 grid grid-cols-2 grid-rows-2 gap-2 border border-cyan-500/30 shadow-inner">
                  {[0, 1, 2, 3].map(slotIdx => {
                    const piece = room.pieces.find(p => p.playerColor === 'blue' && p.id === slotIdx);
                    const isMovable =
                      isMyTurn &&
                      currentTurnPlayer.color === 'blue' &&
                      room.diceRolled &&
                      piece &&
                      piece.step === -1 &&
                      room.validMoves.includes(piece.id);

                    return (
                      <div
                        key={slotIdx}
                        className="bg-cyan-950/30 rounded-lg flex items-center justify-center border border-cyan-500/20"
                      >
                        {piece && piece.step === -1 && (
                          <button
                            disabled={!isMovable}
                            onClick={() => piece && handlePieceClick(piece.id)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center shadow-lg transition-transform ${
                              isMovable ? 'ring-2 ring-white animate-pulse scale-110 cursor-pointer shadow-cyan-500/60' : 'cursor-default'
                            }`}
                          >
                            {MODERN_AVATARS[room.players.find(p => p.color === 'blue')?.ludoAvatar || 'crown'].icon}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Corner Quadrant 4: Yellow Base (Bottom Right) */}
              <div
                className="bg-slate-900 p-2 flex items-center justify-center border-t border-l border-slate-800 relative"
                style={{ gridColumn: '10 / span 6', gridRow: '10 / span 6' }}
              >
                <div className="w-full h-full bg-slate-950/80 rounded-xl p-2 grid grid-cols-2 grid-rows-2 gap-2 border border-amber-500/30 shadow-inner">
                  {[0, 1, 2, 3].map(slotIdx => {
                    const piece = room.pieces.find(p => p.playerColor === 'yellow' && p.id === slotIdx);
                    const isMovable =
                      isMyTurn &&
                      currentTurnPlayer.color === 'yellow' &&
                      room.diceRolled &&
                      piece &&
                      piece.step === -1 &&
                      room.validMoves.includes(piece.id);

                    return (
                      <div
                        key={slotIdx}
                        className="bg-amber-950/30 rounded-lg flex items-center justify-center border border-amber-500/20"
                      >
                        {piece && piece.step === -1 && (
                          <button
                            disabled={!isMovable}
                            onClick={() => piece && handlePieceClick(piece.id)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-lg transition-transform ${
                              isMovable ? 'ring-2 ring-white animate-pulse scale-110 cursor-pointer shadow-amber-500/60' : 'cursor-default'
                            }`}
                          >
                            {MODERN_AVATARS[room.players.find(p => p.color === 'yellow')?.ludoAvatar || 'crown'].icon}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center Nexus Home (3x3 at col 7..9, row 7..9) */}
              <div
                className="relative bg-slate-950 flex items-center justify-center border border-slate-700 shadow-2xl"
                style={{ gridColumn: '7 / span 3', gridRow: '7 / span 3' }}
              >
                <div className="w-full h-full relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:6px_6px] opacity-40" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-amber-500 flex items-center justify-center shadow-lg animate-pulse">
                    <Trophy className="w-5 h-5 text-slate-950" />
                  </div>
                </div>
              </div>

              {/* Outer 52 Track Cells with Modern Glow */}
              {LUDO_GRID_COORDINATES.map((coord, trackIdx) => {
                const piecesHere = getPiecesOnTrack(trackIdx);
                const isSafe = room.rules.safeZones && LUDO_SAFE_POSITIONS.has(trackIdx);
                const isStartRed = trackIdx === 0;
                const isStartGreen = trackIdx === 13;
                const isStartYellow = trackIdx === 26;
                const isStartBlue = trackIdx === 39;

                let cellBg = 'bg-slate-900/90 text-slate-400';
                if (isStartRed) cellBg = 'bg-red-950/80 border-red-500 text-red-300';
                else if (isStartGreen) cellBg = 'bg-emerald-950/80 border-emerald-500 text-emerald-300';
                else if (isStartYellow) cellBg = 'bg-amber-950/80 border-amber-500 text-amber-300';
                else if (isStartBlue) cellBg = 'bg-cyan-950/80 border-cyan-500 text-cyan-300';

                return (
                  <div
                    key={`modern-track-${trackIdx}`}
                    className={`relative flex items-center justify-center ${cellBg} border border-slate-800/80 text-[10px] transition-colors`}
                    style={{
                      gridColumn: coord.col + 1,
                      gridRow: coord.row + 1,
                    }}
                  >
                    {isSafe && !isStartRed && !isStartGreen && !isStartYellow && !isStartBlue && (
                      <span className="text-amber-400 font-bold opacity-80 animate-pulse">✦</span>
                    )}

                    {/* Pieces */}
                    <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                      {piecesHere.map(p => {
                        const owner = room.players.find(pl => pl.id === p.playerId);
                        const isMovable =
                          isMyTurn &&
                          owner?.id === currentTurnPlayer.id &&
                          room.diceRolled &&
                          room.validMoves.includes(p.id);

                        return (
                          <button
                            key={`${p.playerId}-${p.id}`}
                            disabled={!isMovable}
                            onClick={() => handlePieceClick(p.id)}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg ${
                              MODERN_THEMES[p.playerColor].fill
                            } text-white flex items-center justify-center text-[10px] shadow-lg ${
                              isMovable
                                ? 'ring-2 ring-white scale-125 z-20 animate-pulse cursor-pointer shadow-cyan-400/80'
                                : 'z-10 cursor-default'
                            }`}
                          >
                            {MODERN_AVATARS[owner?.ludoAvatar || 'crown'].icon}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Colored Home Columns */}
              {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map(color => {
                const columnCoords = LUDO_HOME_COLUMNS[color];
                const theme = MODERN_THEMES[color];

                return columnCoords.map((coord, idx) => {
                  const piecesHere = getPiecesOnHomeColumn(color, idx);

                  return (
                    <div
                      key={`modern-home-${color}-${idx}`}
                      className={`relative flex items-center justify-center ${theme.bg} border border-slate-800 text-[9px]`}
                      style={{
                        gridColumn: coord.col + 1,
                        gridRow: coord.row + 1,
                      }}
                    >
                      {piecesHere.map(p => {
                        const owner = room.players.find(pl => pl.id === p.playerId);
                        const isMovable =
                          isMyTurn &&
                          owner?.id === currentTurnPlayer.id &&
                          room.diceRolled &&
                          room.validMoves.includes(p.id);

                        return (
                          <button
                            key={`${p.playerId}-${p.id}`}
                            disabled={!isMovable}
                            onClick={() => handlePieceClick(p.id)}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg ${theme.fill} text-white flex items-center justify-center text-[10px] shadow-lg ${
                              isMovable
                                ? 'ring-2 ring-white scale-125 z-20 animate-pulse cursor-pointer'
                                : 'z-10 cursor-default'
                            }`}
                          >
                            {MODERN_AVATARS[owner?.ludoAvatar || 'crown'].icon}
                          </button>
                        );
                      })}
                    </div>
                  );
                });
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Modern Holographic Dice & Rules */}
        <div className="lg:col-span-3 space-y-4 order-3">
          {/* Cyber Dice Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-3 text-center">
              CYBER DICE ENGINE
            </div>

            {/* Glowing Dice */}
            <div className="flex items-center justify-center py-4 bg-slate-950 rounded-xl border border-slate-800 mb-4">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white border-2 border-cyan-400/80 shadow-2xl shadow-cyan-500/30 flex items-center justify-center text-3xl font-extrabold transition-transform ${
                  rollingAnim ? 'rotate-180 scale-110 shadow-cyan-400/80' : ''
                }`}
              >
                {room.ludoDice ? room.ludoDice.value : '🎲'}
              </div>
            </div>

            {/* Result */}
            {room.ludoDice && (
              <div className="text-center mb-4">
                <div className="text-xl font-mono font-extrabold text-white">
                  Result: <span className="text-cyan-400">{room.ludoDice.value}</span>
                </div>
                {room.ludoDice.extraTurn && (
                  <span className="inline-block mt-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-600 px-2 py-0.5 rounded">
                    ★ EXTRA ROLL AUTHORIZED
                  </span>
                )}
              </div>
            )}

            {/* Roll Dice Button */}
            <button
              disabled={!isMyTurn || room.diceRolled || room.isFinished || rollingAnim}
              onClick={handleRoll}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                isMyTurn && !room.diceRolled && !room.isFinished
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-cyan-500/25 animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Zap className={`w-4 h-4 ${rollingAnim ? 'animate-spin' : ''}`} />
              <span>{rollingAnim ? 'CALCULATING...' : 'ROLL DICE'}</span>
            </button>
          </div>

          {/* Room Rules Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-[11px] text-slate-400 space-y-1.5 font-mono">
            <div className="font-bold text-cyan-300 text-xs font-sans">
              Active Room Configuration:
            </div>
            <div className="text-emerald-400 font-semibold">• 1 required to enter: ON</div>
            <div>• Extra turn on 1: {room.rules.extraTurnOnOne ? 'ON' : 'OFF'}</div>
            <div>• Extra turn on capture: {room.rules.extraTurnOnCapture ? 'ON' : 'OFF'}</div>
            <div>• Safe zones: {room.rules.safeZones ? 'ON' : 'OFF'}</div>
            <div>• Blockades: {room.rules.blockades ? 'ON' : 'OFF'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
