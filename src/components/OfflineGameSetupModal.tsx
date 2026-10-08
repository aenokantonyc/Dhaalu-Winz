import React, { useState } from 'react';
import { BoardType, DhayamPieceType, LudoAvatarType, LudoCustomRules, PlayerColor } from '../types/game';
import { X, Play, Users } from 'lucide-react';
import { audio } from '../utils/audio';

interface OfflineGameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBoard?: BoardType;
  onStartOfflineGame: (config: {
    boardType: BoardType;
    playerCount: number;
    playerNames: string[];
    rules: LudoCustomRules;
    dhayamPieces?: DhayamPieceType[];
    ludoAvatars?: LudoAvatarType[];
  }) => void;
}

const PLAYER_COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

export const OfflineGameSetupModal: React.FC<OfflineGameSetupModalProps> = ({
  isOpen,
  onClose,
  defaultBoard = 'dhayam',
  onStartOfflineGame,
}) => {
  const [boardType, setBoardType] = useState<BoardType>(defaultBoard);
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Player 1',
    'Player 2',
    'Player 3',
    'Player 4',
  ]);

  const [rules, setRules] = useState<LudoCustomRules>({
    oneRequiredToEnter: true, // Always locked ON
    extraTurnOnOne: true,
    extraTurnOnCapture: true,
    safeZones: true,
    blockades: true,
  });

  const [dhayamPieces, setDhayamPieces] = useState<DhayamPieceType[]>([
    'sticks',
    'pebbles',
    'shells',
    'tamarind_seeds',
  ]);

  const [ludoAvatars, setLudoAvatars] = useState<LudoAvatarType[]>([
    'crown',
    'star',
    'shield',
    'gem',
  ]);

  if (!isOpen) return null;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playClick();
    onStartOfflineGame({
      boardType,
      playerCount,
      playerNames: playerNames.slice(0, playerCount),
      rules,
      dhayamPieces: boardType === 'dhayam' ? dhayamPieces.slice(0, playerCount) : undefined,
      ludoAvatars: boardType !== 'dhayam' ? ludoAvatars.slice(0, playerCount) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative text-slate-100 my-8">
        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
          PLAY OFFLINE (PASS & PLAY)
        </h2>

        <form onSubmit={handleStart} className="space-y-6">
          {/* BOARD SELECTION */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              SELECT BOARD
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setBoardType('dhayam');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  boardType === 'dhayam'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                Dhayam
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setBoardType('classic_ludo');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  boardType === 'classic_ludo'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                Classic Ludo
              </button>

              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setBoardType('modern_ludo');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  boardType === 'modern_ludo'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                Modern Ludo
              </button>
            </div>
          </div>

          {/* PLAYER COUNT */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              NUMBER OF PLAYERS
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    setPlayerCount(num);
                  }}
                  className={`py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                    playerCount === num
                      ? 'bg-slate-100 text-slate-900 border-white'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {num} Players
                </button>
              ))}
            </div>
          </div>

          {/* RULES */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              RULES
            </label>
            {boardType === 'dhayam' ? (
              <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-200/90 space-y-1">
                <div className="font-semibold text-amber-300">Fixed Dhayam Rules</div>
                <div>· 1 required to enter board</div>
                <div>· Extra roll on 1, 5, 6, 12, or capture</div>
                <div>· Malai (✕) safe squares & Pazham objective</div>
              </div>
            ) : (
              <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/60">
                  <span className="font-medium">1 required to enter</span>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                    LOCKED ON
                  </span>
                </div>

                <label className="flex items-center justify-between text-slate-300 py-1 cursor-pointer">
                  <span>Extra turn on 1</span>
                  <input
                    type="checkbox"
                    checked={rules.extraTurnOnOne}
                    onChange={e => setRules({ ...rules, extraTurnOnOne: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 py-1 cursor-pointer">
                  <span>Extra turn on capture</span>
                  <input
                    type="checkbox"
                    checked={rules.extraTurnOnCapture}
                    onChange={e => setRules({ ...rules, extraTurnOnCapture: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 py-1 cursor-pointer">
                  <span>Safe zones</span>
                  <input
                    type="checkbox"
                    checked={rules.safeZones}
                    onChange={e => setRules({ ...rules, safeZones: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between text-slate-300 py-1 cursor-pointer">
                  <span>Blockades (2 pieces block)</span>
                  <input
                    type="checkbox"
                    checked={rules.blockades}
                    onChange={e => setRules({ ...rules, blockades: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>
              </div>
            )}
          </div>

          {/* PLAYER NAMES & PIECES */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              PLAYER NAMES
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: playerCount }).map((_, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {PLAYER_COLORS[idx]}
                    </span>
                    <span className="text-xs">
                      {boardType === 'dhayam'
                        ? dhayamPieces[idx] === 'sticks'
                          ? '🥢'
                          : dhayamPieces[idx] === 'pebbles'
                          ? '🪨'
                          : dhayamPieces[idx] === 'shells'
                          ? '🐚'
                          : '🌰'
                        : ludoAvatars[idx] === 'crown'
                        ? '👑'
                        : ludoAvatars[idx] === 'star'
                        ? '⭐'
                        : ludoAvatars[idx] === 'shield'
                        ? '🛡️'
                        : '💎'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={playerNames[idx]}
                    maxLength={12}
                    onChange={e => {
                      const updated = [...playerNames];
                      updated[idx] = e.target.value;
                      setPlayerNames(updated);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START OFFLINE MATCH</span>
          </button>
        </form>
      </div>
    </div>
  );
};
