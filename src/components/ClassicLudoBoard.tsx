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
import { Crown, Star, Shield, Gem, Dices, Award } from 'lucide-react';

interface ClassicLudoBoardProps {
  room: RoomState;
  currentUserId: string;
  onRollDice: () => void;
  onMovePiece: (pieceId: number) => void;
  isOfflineMode?: boolean;
}

const AVATAR_ICONS: Record<LudoAvatarType, React.ReactNode> = {
  crown: <Crown className="w-3.5 h-3.5" />,
  star: <Star className="w-3.5 h-3.5" />,
  shield: <Shield className="w-3.5 h-3.5" />,
  gem: <Gem className="w-3.5 h-3.5" />,
};

const COLOR_CONFIG: Record<PlayerColor, {
  name: string;
  bg: string;
  border: string;
  text: string;
  badge: string;
  startTrack: number;
}> = {
  red: { name: 'Red', bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-400', badge: 'bg-red-950 text-red-300', startTrack: 0 },
  green: { name: 'Green', bg: 'bg-emerald-600', border: 'border-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-950 text-emerald-300', startTrack: 13 },
  yellow: { name: 'Yellow', bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-400', badge: 'bg-amber-950 text-amber-300', startTrack: 26 },
  blue: { name: 'Blue', bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-400', badge: 'bg-blue-950 text-blue-300', startTrack: 39 },
};

export const ClassicLudoBoard: React.FC<ClassicLudoBoardProps> = ({
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

  // Helper to find pieces on a specific track square (0..51)
  const getPiecesOnTrack = (trackIndex: number) => {
    return room.pieces.filter(p => {
      if (p.isFinished || p.step === -1) return false;
      const pos = getLudoTrackPosition(p.playerColor, p.step);
      return pos.type === 'track' && pos.index === trackIndex;
    });
  };

  // Helper to find pieces on a colored home column
  const getPiecesOnHomeColumn = (color: PlayerColor, colIndex: number) => {
    return room.pieces.filter(p => {
      if (p.isFinished || p.step === -1 || p.playerColor !== color) return false;
      const pos = getLudoTrackPosition(p.playerColor, p.step);
      return pos.type === 'home_column' && pos.index === colIndex;
    });
  };

  // Finished pieces in center home
  const getFinishedPiecesForColor = (color: PlayerColor) => {
    return room.pieces.filter(p => p.playerColor === color && p.isFinished);
  };

  // Base pieces for player
  const getBasePieces = (color: PlayerColor) => {
    return room.pieces.filter(p => p.playerColor === color && p.step === -1);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 select-none">
      {/* Turn Indicator & Status Banner */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${COLOR_CONFIG[currentTurnPlayer.color].bg} animate-pulse shadow-md`} />
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Classic Ludo · Turn
            </div>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span>{currentTurnPlayer.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${COLOR_CONFIG[currentTurnPlayer.color].badge}`}>
                {currentTurnPlayer.color}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300 text-center sm:text-right max-w-md bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
          {room.statusMessage}
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Players & Pieces Summary */}
        <div className="lg:col-span-3 space-y-3 order-2 lg:order-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Players & Home Bases
          </div>

          {room.players.map(player => {
            const isTurn = player.id === currentTurnPlayer.id;
            const basePieces = getBasePieces(player.color);
            const finishedPieces = getFinishedPiecesForColor(player.color);
            const avatar = player.ludoAvatar || 'crown';

            return (
              <div
                key={player.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isTurn
                    ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">{AVATAR_ICONS[avatar]}</span>
                    <span className="font-bold text-white text-xs truncate max-w-[110px]">
                      {player.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${COLOR_CONFIG[player.color].text}`}>
                    {player.color}
                  </span>
                </div>

                {/* Base Pieces Slot (Needs 1 to enter) */}
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 mb-1 flex justify-between">
                    <span>Base (Needs 1 to enter):</span>
                    <span>{basePieces.length} / 4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {basePieces.map(piece => {
                      const isValid = isMyTurn && isTurn && room.diceRolled && room.validMoves.includes(piece.id);
                      return (
                        <button
                          key={piece.id}
                          disabled={!isValid}
                          onClick={() => handlePieceClick(piece.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs text-white transition-all ${
                            COLOR_CONFIG[player.color].bg
                          } ${
                            isValid
                              ? 'ring-2 ring-white scale-110 cursor-pointer animate-bounce'
                              : 'opacity-50 cursor-default'
                          }`}
                          title={`Piece ${piece.id + 1} at Base`}
                        >
                          {AVATAR_ICONS[avatar]}
                        </button>
                      );
                    })}
                    {basePieces.length === 0 && (
                      <span className="text-[11px] text-slate-500 italic">All pieces on track</span>
                    )}
                  </div>
                </div>

                {/* Finished count */}
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between px-1">
                  <span>Home Completed:</span>
                  <span className="font-bold text-emerald-400">{finishedPieces.length} / 4</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: The Traditional 15x15 Ludo Board */}
        <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
          <div className="relative p-2 sm:p-3 rounded-2xl bg-white shadow-2xl max-w-[480px] w-full aspect-square border-4 border-slate-800">
            {/* 15x15 Grid Layout */}
            <div className="w-full h-full grid grid-cols-15 grid-rows-15 gap-[1px] bg-slate-900 border border-slate-900">
              {/* Corner Quadrant 1: Red Yard (Top Left: 0..5 cols, 0..5 rows) */}
              <div
                className="bg-red-600 p-2 sm:p-3 flex items-center justify-center rounded-tl-xl relative"
                style={{ gridColumn: '1 / span 6', gridRow: '1 / span 6' }}
              >
                <div className="w-full h-full bg-white rounded-xl p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
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
                        className="bg-red-100 rounded-full flex items-center justify-center border-2 border-red-300"
                      >
                        {piece && piece.step === -1 && (
                          <button
                            disabled={!isMovable}
                            onClick={() => piece && handlePieceClick(piece.id)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md ${
                              isMovable ? 'ring-2 ring-amber-400 animate-bounce scale-110 cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            {AVATAR_ICONS[room.players.find(p => p.color === 'red')?.ludoAvatar || 'crown']}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Corner Quadrant 2: Green Yard (Top Right: 9..14 cols, 0..5 rows) */}
              <div
                className="bg-emerald-600 p-2 sm:p-3 flex items-center justify-center rounded-tr-xl relative"
                style={{ gridColumn: '10 / span 6', gridRow: '1 / span 6' }}
              >
                <div className="w-full h-full bg-white rounded-xl p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
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
                        className="bg-emerald-100 rounded-full flex items-center justify-center border-2 border-emerald-300"
                      >
                        {piece && piece.step === -1 && (
                          <button
                            disabled={!isMovable}
                            onClick={() => piece && handlePieceClick(piece.id)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md ${
                              isMovable ? 'ring-2 ring-amber-400 animate-bounce scale-110 cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            {AVATAR_ICONS[room.players.find(p => p.color === 'green')?.ludoAvatar || 'crown']}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Corner Quadrant 3: Blue Yard (Bottom Left: 0..5 cols, 9..14 rows) */}
              <div
                className="bg-blue-600 p-2 sm:p-3 flex items-center justify-center rounded-bl-xl relative"
                style={{ gridColumn: '1 / span 6', gridRow: '10 / span 6' }}
              >
                <div className="w-full h-full bg-white rounded-xl p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
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
                        className="bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-300"
                      >
                        {piece && piece.step === -1 && (
                          <button
                            disabled={!isMovable}
                            onClick={() => piece && handlePieceClick(piece.id)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md ${
                              isMovable ? 'ring-2 ring-amber-400 animate-bounce scale-110 cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            {AVATAR_ICONS[room.players.find(p => p.color === 'blue')?.ludoAvatar || 'crown']}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Corner Quadrant 4: Yellow Yard (Bottom Right: 9..14 cols, 9..14 rows) */}
              <div
                className="bg-amber-500 p-2 sm:p-3 flex items-center justify-center rounded-br-xl relative"
                style={{ gridColumn: '10 / span 6', gridRow: '10 / span 6' }}
              >
                <div className="w-full h-full bg-white rounded-xl p-2 grid grid-cols-2 grid-rows-2 gap-2 shadow-inner">
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
                        className="bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-300"
                      >
                        {piece && piece.step === -1 && (
                          <button
                            disabled={!isMovable}
                            onClick={() => piece && handlePieceClick(piece.id)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md ${
                              isMovable ? 'ring-2 ring-amber-400 animate-bounce scale-110 cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            {AVATAR_ICONS[room.players.find(p => p.color === 'yellow')?.ludoAvatar || 'crown']}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Center Home Triangle: 3x3 at col 7..9, row 7..9 */}
              <div
                className="relative bg-white flex items-center justify-center overflow-hidden"
                style={{ gridColumn: '7 / span 3', gridRow: '7 / span 3' }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full relative">
                    {/* 4 Colored Triangles converging */}
                    <div className="absolute inset-0 bg-red-600 [clip-path:polygon(0_0,50%_50%,0_100%)]" />
                    <div className="absolute inset-0 bg-emerald-600 [clip-path:polygon(0_0,100%_0,50%_50%)]" />
                    <div className="absolute inset-0 bg-amber-500 [clip-path:polygon(100%_0,100%_100%,50%_50%)]" />
                    <div className="absolute inset-0 bg-blue-600 [clip-path:polygon(0_100%,100%_100%,50%_50%)]" />
                    <div className="absolute inset-2 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Award className="w-5 h-5 text-amber-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Render the 52 Outer Track Cells */}
              {LUDO_GRID_COORDINATES.map((coord, trackIdx) => {
                const piecesHere = getPiecesOnTrack(trackIdx);
                const isSafe = room.rules.safeZones && LUDO_SAFE_POSITIONS.has(trackIdx);
                const isStartRed = trackIdx === 0;
                const isStartGreen = trackIdx === 13;
                const isStartYellow = trackIdx === 26;
                const isStartBlue = trackIdx === 39;

                let cellBg = 'bg-white';
                if (isStartRed) cellBg = 'bg-red-500 text-white';
                else if (isStartGreen) cellBg = 'bg-emerald-500 text-white';
                else if (isStartYellow) cellBg = 'bg-amber-400 text-white';
                else if (isStartBlue) cellBg = 'bg-blue-500 text-white';

                return (
                  <div
                    key={`track-${trackIdx}`}
                    className={`relative flex items-center justify-center ${cellBg} border border-slate-300 text-[10px]`}
                    style={{
                      gridColumn: coord.col + 1,
                      gridRow: coord.row + 1,
                    }}
                  >
                    {isSafe && !isStartRed && !isStartGreen && !isStartYellow && !isStartBlue && (
                      <span className="text-amber-500 font-bold opacity-75">★</span>
                    )}

                    {/* Pieces on this cell */}
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
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                              COLOR_CONFIG[p.playerColor].bg
                            } text-white flex items-center justify-center text-[10px] shadow-md ${
                              isMovable
                                ? 'ring-2 ring-amber-400 scale-125 z-20 animate-pulse cursor-pointer'
                                : 'z-10 cursor-default'
                            }`}
                          >
                            {AVATAR_ICONS[owner?.ludoAvatar || 'crown']}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Render Colored Home Columns (5 squares each) */}
              {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map(color => {
                const columnCoords = LUDO_HOME_COLUMNS[color];
                const bgClass =
                  color === 'red'
                    ? 'bg-red-500'
                    : color === 'green'
                    ? 'bg-emerald-500'
                    : color === 'yellow'
                    ? 'bg-amber-400'
                    : 'bg-blue-500';

                return columnCoords.map((coord, idx) => {
                  const piecesHere = getPiecesOnHomeColumn(color, idx);

                  return (
                    <div
                      key={`home-${color}-${idx}`}
                      className={`relative flex items-center justify-center ${bgClass} border border-white text-white text-[9px]`}
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
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                              COLOR_CONFIG[p.playerColor].bg
                            } text-white flex items-center justify-center text-[10px] shadow-md border border-white ${
                              isMovable
                                ? 'ring-2 ring-white scale-125 z-20 animate-pulse cursor-pointer'
                                : 'z-10 cursor-default'
                            }`}
                          >
                            {AVATAR_ICONS[owner?.ludoAvatar || 'crown']}
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

        {/* Right Side: Classic Dice Roller & Custom Rules Summary */}
        <div className="lg:col-span-3 space-y-4 order-3">
          {/* Dice Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Ludo Dice
            </div>

            {/* 6-sided Dice */}
            <div className="flex items-center justify-center py-4 bg-slate-950 rounded-xl border border-slate-800 mb-4">
              <div
                className={`w-16 h-16 rounded-xl bg-white text-slate-950 border-2 border-slate-200 shadow-xl flex items-center justify-center text-3xl font-extrabold transition-transform ${
                  rollingAnim ? 'rotate-180 scale-110' : ''
                }`}
              >
                {room.ludoDice ? room.ludoDice.value : '🎲'}
              </div>
            </div>

            {/* Result */}
            {room.ludoDice && (
              <div className="text-center mb-4">
                <div className="text-xl font-extrabold text-white">
                  Rolled: {room.ludoDice.value}
                </div>
                {room.ludoDice.extraTurn && (
                  <span className="inline-block mt-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded">
                    ★ EXTRA TURN ELIGIBLE
                  </span>
                )}
              </div>
            )}

            {/* Roll Button */}
            <button
              disabled={!isMyTurn || room.diceRolled || room.isFinished || rollingAnim}
              onClick={handleRoll}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                isMyTurn && !room.diceRolled && !room.isFinished
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Dices className={`w-4 h-4 ${rollingAnim ? 'animate-spin' : ''}`} />
              <span>{rollingAnim ? 'ROLLING...' : 'ROLL DICE'}</span>
            </button>
          </div>

          {/* Active Custom Rules Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-200 text-xs">
              Selected Room Rules:
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
