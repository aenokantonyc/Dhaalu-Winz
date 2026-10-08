import React, { useState, useEffect } from 'react';
import {
  BoardType,
  DhayamPieceType,
  LudoAvatarType,
  LudoCustomRules,
  PlayerColor,
  MODERN_LUDO_STANDARD_RULES,
  CLASSIC_LUDO_DEFAULT_RULES,
} from '../types/game';
import { X, Play } from 'lucide-react';
import { audio } from '../utils/audio';
import { RuleCustomizer } from './RuleCustomizer';

interface OfflineGameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardType: BoardType;
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
  boardType,
  onStartOfflineGame,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(4);
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Player 1',
    'Player 2',
    'Player 3',
    'Player 4',
  ]);

  const [rules, setRules] = useState<LudoCustomRules>(
    boardType === 'modern_ludo' ? MODERN_LUDO_STANDARD_RULES : CLASSIC_LUDO_DEFAULT_RULES
  );

  useEffect(() => {
    if (boardType === 'modern_ludo') {
      setRules(MODERN_LUDO_STANDARD_RULES);
    } else if (boardType === 'classic_ludo') {
      setRules(CLASSIC_LUDO_DEFAULT_RULES);
    }
  }, [boardType]);

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
      rules: boardType === 'modern_ludo' ? MODERN_LUDO_STANDARD_RULES : rules,
      dhayamPieces: boardType === 'dhayam' ? dhayamPieces.slice(0, playerCount) : undefined,
      ludoAvatars: boardType !== 'dhayam' ? ludoAvatars.slice(0, playerCount) : undefined,
    });
  };

  const getTitle = () => {
    if (boardType === 'dhayam') return 'Play Dhayam';
    if (boardType === 'modern_ludo') return 'Play Modern Ludo';
    return 'Play Classic Ludo';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative text-slate-100 my-8">
        <button
          type="button"
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">
              {boardType === 'dhayam' ? '🎲' : boardType === 'classic_ludo' ? '♟️' : '✨'}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white uppercase">
              {getTitle()} (Pass & Play)
            </h2>
          </div>
        </div>

        <form onSubmit={handleStart} className="space-y-6">
          {/* NUMBER OF PLAYERS */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Number of Players
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

          {/* RULES SECTION */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Rules
            </label>

            {boardType === 'modern_ludo' ? (
              /* Modern Ludo: No toggle buttons, all rules standard and selected */
              <div className="p-3.5 bg-slate-950 border border-emerald-900/40 rounded-xl text-xs space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center justify-between">
                  <span>Standard Modern Rules</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
                    ALL SELECTED
                  </span>
                </div>
                <div className="text-slate-300 grid grid-cols-2 gap-1 text-[11px] pt-1 border-t border-slate-800/80">
                  <div>✓ Entry on 6</div>
                  <div>✓ Extra roll on 6 & capture</div>
                  <div>✓ Star safe zones active</div>
                  <div>✓ 4 pieces to win</div>
                </div>
              </div>
            ) : boardType === 'dhayam' ? (
              /* Dhayam: Fixed authentic rules */
              <div className="p-3.5 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-200/90 space-y-1">
                <div className="font-bold text-amber-300">Authentic Dhayam Rules</div>
                <div>• Roll 1 (Dhayam) to enter board</div>
                <div>• Extra roll on 1, 5, 6, 12, or capture</div>
                <div>• Cross (Malai) safe squares</div>
              </div>
            ) : (
              /* Classic Ludo: Player can define rules */
              <RuleCustomizer rules={rules} onChange={setRules} />
            )}
          </div>

          {/* PLAYER NAMES & PIECES */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Players
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
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white outline-none focus:border-slate-600"
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
            <span>START MATCH</span>
          </button>
        </form>
      </div>
    </div>
  );
};
