import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { audio } from '../utils/audio';
import { Trophy, RotateCcw, Home, Sparkles } from 'lucide-react';
import { BoardType } from '../types/game';

interface VictoryModalProps {
  isOpen: boolean;
  winnerName: string;
  boardType: BoardType;
  onRematch: () => void;
  onExit: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winnerName,
  boardType,
  onRematch,
  onExit,
}) => {
  useEffect(() => {
    if (isOpen) {
      audio.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const boardLabel =
    boardType === 'dhayam'
      ? 'Traditional Dhayam'
      : boardType === 'classic_ludo'
      ? 'Classic Ludo'
      : 'Modern Ludo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl text-center text-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />

        <div className="w-20 h-20 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/20">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        <div className="text-xs uppercase font-mono tracking-widest text-amber-400 mb-1">
          VICTORY DECLARED · {boardLabel.toUpperCase()}
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-2">
          {winnerName} Wins!
        </h2>

        <p className="text-xs text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
          All objective criteria fulfilled. All required pieces have reached home!
        </p>

        {/* Action Buttons: Rematch & Exit */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              audio.playClick();
              onRematch();
            }}
            className="flex-1 py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REMATCH</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onExit();
            }}
            className="flex-1 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>EXIT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
