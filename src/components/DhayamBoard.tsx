import React, { useState } from 'react';
import { DhayamDiceResult, PieceState, Player, PlayerColor, RoomState } from '../types/game';
import {
  DHAYAM_SAFE_COORDINATES,
  getDhayamPathForColor,
  getDhayamPieceCoords,
} from '../utils/dhayamEngine';
import { audio } from '../utils/audio';
import { Crown, Sparkles, RefreshCw } from 'lucide-react';

interface DhayamBoardProps {
  room: RoomState;
  currentUserId: string;
  onRollDice: () => void;
  onMovePiece: (pieceId: number) => void;
  isOfflineMode?: boolean;
}

const PLAYER_COLOR_THEMES: Record<PlayerColor, { ring: string; text: string; bg: string; dot: string }> = {
  red: { ring: 'ring-red-500', text: 'text-red-400', bg: 'bg-red-600', dot: 'bg-red-500' },
  green: { ring: 'ring-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-600', dot: 'bg-emerald-500' },
  yellow: { ring: 'ring-amber-500', text: 'text-amber-400', bg: 'bg-amber-500', dot: 'bg-amber-400' },
  blue: { ring: 'ring-blue-500', text: 'text-blue-400', bg: 'bg-blue-600', dot: 'bg-blue-500' },
};

const TRADITIONAL_PIECE_SYMBOLS: Record<string, string> = {
  sticks: '🥢',
  pebbles: '🪨',
  shells: '🐚',
  tamarind_seeds: '🌰',
};

export const DhayamBoard: React.FC<DhayamBoardProps> = ({
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
    }, 450);
  };

  const handlePieceClick = (pieceId: number) => {
    if (!isMyTurn || !room.diceRolled || room.isFinished) return;
    if (!room.validMoves.includes(pieceId)) return;
    audio.playPieceMove();
    onMovePiece(pieceId);
  };

  // Find pieces in base for each player
  const getBasePieces = (playerId: string) => {
    return room.pieces.filter(p => p.playerId === playerId && p.step === -1);
  };

  // Find pieces currently on coordinate (x,y)
  const getPiecesAtCoord = (x: number, y: number) => {
    return room.pieces.filter(p => {
      if (p.isFinished || p.step === -1) return false;
      const coord = getDhayamPieceCoords(p);
      return coord && coord.x === x && coord.y === y;
    });
  };

  // Find finished pieces at Pazham (3,3)
  const getFinishedPieces = () => {
    return room.pieces.filter(p => p.isFinished);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 select-none">
      {/* Traditional Header / Status Banner */}
      <div className="w-full bg-stone-900/90 border border-amber-900/40 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded-full ${
              PLAYER_COLOR_THEMES[currentTurnPlayer.color].dot
            } animate-pulse shadow-md`}
          />
          <div>
            <div className="text-xs uppercase font-serif tracking-wider text-amber-300/80">
              Traditional Dhayam · Turn
            </div>
            <div className="text-lg font-bold text-white flex items-center gap-2 font-serif">
              <span>{currentTurnPlayer.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-sans uppercase font-bold bg-stone-800 ${PLAYER_COLOR_THEMES[currentTurnPlayer.color].text}`}>
                {currentTurnPlayer.color}
              </span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-xs text-amber-200/90 text-center sm:text-right max-w-md bg-stone-950/60 px-3.5 py-2 rounded-xl border border-amber-900/30">
          {room.statusMessage}
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Players & Bases */}
        <div className="lg:col-span-3 space-y-3 order-2 lg:order-1">
          <div className="text-xs font-serif font-bold uppercase tracking-wider text-amber-400 px-1">
            Player Courts & Pieces
          </div>

          {room.players.map(player => {
            const isTurn = player.id === currentTurnPlayer.id;
            const basePieces = getBasePieces(player.id);
            const finishedPieces = room.pieces.filter(p => p.playerId === player.id && p.isFinished);
            const pieceSymbol = TRADITIONAL_PIECE_SYMBOLS[player.dhayamPiece || 'sticks'];

            return (
              <div
                key={player.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isTurn
                    ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-900/70 border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{pieceSymbol}</span>
                    <span className="font-bold text-white text-xs font-serif truncate max-w-[110px]">
                      {player.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${PLAYER_COLOR_THEMES[player.color].text}`}>
                    {player.color}
                  </span>
                </div>

                {/* Base Pieces Slot */}
                <div className="bg-stone-950/80 p-2 rounded-lg border border-stone-800">
                  <div className="text-[10px] text-amber-400/70 mb-1 flex justify-between">
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
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
                            isValid
                              ? 'bg-amber-500 hover:bg-amber-400 ring-2 ring-white scale-110 cursor-pointer animate-bounce'
                              : 'bg-stone-800 opacity-60 cursor-default'
                          }`}
                          title={`Piece ${piece.id + 1} at Base`}
                        >
                          {pieceSymbol}
                        </button>
                      );
                    })}
                    {basePieces.length === 0 && (
                      <span className="text-[11px] text-stone-500 italic">All pieces on board</span>
                    )}
                  </div>
                </div>

                {/* Finished count */}
                <div className="mt-2 text-[10px] text-stone-400 flex items-center justify-between px-1">
                  <span>In Pazham (Goal):</span>
                  <span className="font-bold text-amber-400">{finishedPieces.length} / 4</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: The Traditional 7x7 Dhayam Board */}
        <div className="lg:col-span-6 flex flex-col items-center order-1 lg:order-2">
          <div className="relative p-3 sm:p-4 rounded-3xl bg-stone-900 border-2 border-amber-900/60 shadow-2xl overflow-hidden max-w-[480px] w-full aspect-square">
            {/* Background Texture with authentic wood/parchment warmth */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
              style={{ backgroundImage: `url('/src/assets/images/dhayam_traditional_board_1791450493946.jpg')` }}
            />

            {/* Board Grid: 7x7 */}
            <div className="relative w-full h-full grid grid-cols-7 grid-rows-7 gap-1 sm:gap-1.5 p-1 bg-stone-950/70 rounded-2xl border border-amber-950/80">
              {Array.from({ length: 49 }).map((_, idx) => {
                const x = idx % 7;
                const y = Math.floor(idx / 7);
                const isSafe = DHAYAM_SAFE_COORDINATES.has(`${x},${y}`);
                const isPazham = x === 3 && y === 3;
                const isCorner = (x === 0 || x === 6) && (y === 0 || y === 6);
                const isEntryMidpoint = (x === 3 && y === 0) || (x === 6 && y === 3) || (x === 3 && y === 6) || (x === 0 && y === 3);

                // Check pieces at this coordinate
                const piecesHere = getPiecesAtCoord(x, y);

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`relative rounded-lg flex items-center justify-center transition-all ${
                      isPazham
                        ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-600 border-2 border-yellow-300 shadow-lg'
                        : isSafe
                        ? 'bg-amber-950/60 border border-amber-600/70 text-amber-300 shadow-inner'
                        : 'bg-stone-900/80 border border-stone-800/80 hover:border-amber-900/50'
                    }`}
                  >
                    {/* Cross (Malai) marking for safe squares */}
                    {isSafe && !isPazham && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 text-amber-400 font-bold text-sm sm:text-base select-none">
                        ✕
                      </div>
                    )}

                    {/* Center Pazham Crown */}
                    {isPazham && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none text-yellow-100 font-serif">
                        <Crown className="w-5 h-5 text-yellow-200 fill-yellow-200" />
                        <span className="text-[8px] font-bold tracking-wider">PAZHAM</span>
                      </div>
                    )}

                    {/* Pieces currently on this cell */}
                    <div className="relative z-10 flex flex-wrap items-center justify-center gap-0.5 p-0.5">
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
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm shadow-md transition-all ${
                              PLAYER_COLOR_THEMES[p.playerColor].bg
                            } text-white ${
                              isMovable
                                ? 'ring-2 ring-yellow-300 animate-pulse scale-110 cursor-pointer shadow-yellow-500/50'
                                : 'cursor-default'
                            }`}
                            title={`${owner?.name}'s piece`}
                          >
                            <span>{TRADITIONAL_PIECE_SYMBOLS[owner?.dhayamPiece || 'sticks']}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Dayakattai Brass Dice & Controls */}
        <div className="lg:col-span-3 space-y-4 order-3">
          {/* Dayakattai Dice Box */}
          <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-5 shadow-xl">
            <div className="text-xs font-serif font-bold uppercase tracking-wider text-amber-400 mb-3 text-center">
              Dayakattai (Brass Dice)
            </div>

            {/* 2 Traditional Long Cuboid Dice */}
            <div className="flex items-center justify-center gap-4 py-4 bg-stone-950/80 rounded-xl border border-stone-800 mb-4">
              {/* Die 1 */}
              <div
                className={`w-12 h-20 rounded-md bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 border-2 border-amber-300 shadow-md flex flex-col items-center justify-center transition-transform ${
                  rollingAnim ? 'rotate-180 scale-105' : ''
                }`}
              >
                <span className="text-xs font-serif font-black text-stone-950">
                  {room.dhayamDice ? room.dhayamDice.die1 : '1'}
                </span>
                <div className="flex flex-col gap-1 mt-1">
                  {Array.from({ length: room.dhayamDice ? room.dhayamDice.die1 : 1 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-stone-950 shadow-inner" />
                  ))}
                  {(room.dhayamDice?.die1 === 0 || (!room.dhayamDice && false)) && (
                    <span className="text-[9px] font-bold text-stone-900">BLANK</span>
                  )}
                </div>
              </div>

              {/* Die 2 */}
              <div
                className={`w-12 h-20 rounded-md bg-gradient-to-b from-amber-400 via-amber-600 to-amber-800 border-2 border-amber-300 shadow-md flex flex-col items-center justify-center transition-transform ${
                  rollingAnim ? '-rotate-180 scale-105' : ''
                }`}
              >
                <span className="text-xs font-serif font-black text-stone-950">
                  {room.dhayamDice ? room.dhayamDice.die2 : '0'}
                </span>
                <div className="flex flex-col gap-1 mt-1">
                  {Array.from({ length: room.dhayamDice ? room.dhayamDice.die2 : 0 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-stone-950 shadow-inner" />
                  ))}
                  {room.dhayamDice?.die2 === 0 && (
                    <span className="text-[9px] font-bold text-stone-900">BLANK</span>
                  )}
                </div>
              </div>
            </div>

            {/* Dice Result Display */}
            {room.dhayamDice && (
              <div className="text-center mb-4">
                <div className="text-2xl font-serif font-extrabold text-amber-300">
                  {room.dhayamDice.isDhayam ? 'DHAYAM! (1)' : `Roll: ${room.dhayamDice.total}`}
                </div>
                {room.dhayamDice.extraTurn && (
                  <span className="inline-block mt-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded">
                    ★ EXTRA TURN ELIGIBLE
                  </span>
                )}
              </div>
            )}

            {/* Roll Dice Button */}
            <button
              disabled={!isMyTurn || room.diceRolled || room.isFinished || rollingAnim}
              onClick={handleRoll}
              className={`w-full py-3.5 rounded-xl text-sm font-serif font-bold tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${
                isMyTurn && !room.diceRolled && !room.isFinished
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer animate-pulse'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${rollingAnim ? 'animate-spin' : ''}`} />
              <span>{rollingAnim ? 'ROLLING...' : 'ROLL DHAYAM DICE'}</span>
            </button>
          </div>

          {/* Traditional Rule Summary Card */}
          <div className="bg-stone-900/60 border border-amber-950/60 rounded-xl p-3.5 text-[11px] text-stone-400 space-y-1.5">
            <div className="font-serif font-bold text-amber-300 text-xs">
              Traditional Dhayam Rules:
            </div>
            <div>• Roll 1 (Dhayam) to unlock pieces from base</div>
            <div>• Rolls of 1, 5, 6, 12 grant an extra roll</div>
            <div>• Opponent captures grant an extra roll</div>
            <div>• Cross squares (✕) are safe zones</div>
            <div>• Navigate outer & inner loops to reach Pazham</div>
          </div>
        </div>
      </div>
    </div>
  );
};
