import React, { useState } from 'react';
import { X, BookOpen, Shield, Dices, Award } from 'lucide-react';
import { audio } from '../utils/audio';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'dhayam' | 'classic' | 'modern';
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'dhayam',
}) => {
  const [tab, setTab] = useState<'dhayam' | 'classic' | 'modern'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative text-slate-100 my-8 max-h-[90vh] flex flex-col">
        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Rules & How to Play
            </h2>
            <p className="text-xs text-slate-400">
              Clear guides for Dhayam, Classic Ludo, and Modern Ludo
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6 shrink-0">
          <button
            onClick={() => {
              audio.playClick();
              setTab('dhayam');
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'dhayam'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dhayam
          </button>
          <button
            onClick={() => {
              audio.playClick();
              setTab('classic');
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'classic'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Classic Ludo
          </button>
          <button
            onClick={() => {
              audio.playClick();
              setTab('modern');
            }}
            className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'modern'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Modern Ludo
          </button>
        </div>

        {/* Content area */}
        <div className="overflow-y-auto pr-1 space-y-4 text-xs text-slate-300 leading-relaxed">
          {tab === 'dhayam' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-xl">
                <h3 className="text-sm font-bold text-amber-300 mb-1">
                  1. Dhayam Board & Pieces
                </h3>
                <p>
                  Dhayam is an ancient Indian strategic board game played on a concentric square board. Players select traditional pieces: <strong>Sticks, Pebbles, Shells, or Tamarind seeds</strong>.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white">
                  2. Dayakattai Brass Dice
                </h3>
                <p>Played with two brass stick dice having faces 0 (blank), 1, 2, and 3:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>0 + 1 = 1 (Dhayam)</strong>: Unlocks pieces from base & awards an extra roll!</li>
                  <li><strong>0 + 0 = 12 (Dhaayam 12)</strong>: Awards an extra roll!</li>
                  <li><strong>Sums of 5 & 6</strong>: Also grant an extra roll!</li>
                  <li>Other rolls (2, 3, 4) advance pieces normally.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white">
                  3. Entry, Safe Zones & Captures
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>1 is required to enter:</strong> A player must roll 1 (Dhayam) to move a piece out of base to the starting position.</li>
                  <li><strong>Safe Squares (Malai ✕):</strong> Marked with a cross. Pieces on cross squares cannot be captured.</li>
                  <li><strong>Capturing (Vettu):</strong> Landing on an opponent piece on a non-safe square captures it, sending it back to base, and awards an extra roll!</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white">
                  4. Objective (Pazham)
                </h3>
                <p>
                  Pieces navigate the outer perimeter track, turn into the inner track, and culminate at the center <strong>Pazham (Fruit)</strong> square. The first player to bring all pieces to the Pazham wins!
                </p>
              </div>
            </div>
          )}

          {tab === 'classic' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl">
                <h3 className="text-sm font-bold text-blue-300 mb-1">
                  1. Classic / Normal Ludo Overview
                </h3>
                <p>
                  Played on the traditional 4-quadrant cross board with Red, Green, Yellow, and Blue bases. 2 to 4 players, each controlling 4 pieces.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white">
                  2. 1 Required to Enter Base
                </h3>
                <p>
                  <strong>A player must get 1 to bring a piece out of the base.</strong> Once a 1 is rolled, the player can choose to deploy an eligible piece onto their starting track square.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white">
                  3. Selected Custom Rules
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>Extra turn on 1:</strong> Rolling a 1 gives the player an immediate extra turn.</li>
                  <li><strong>Extra turn on capture:</strong> Capturing an opponent piece sends it back to base and awards an extra turn.</li>
                  <li><strong>Safe zones:</strong> Star squares protect pieces from captures.</li>
                  <li><strong>Blockades:</strong> Two pieces of the same color on a square block opponents from passing or landing.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white">
                  4. Winning Objective
                </h3>
                <p>
                  Pieces complete the 52-square loop, enter their player's colored home column, and reach the central triangle. The first player to get all 4 pieces home wins!
                </p>
              </div>
            </div>
          )}

          {tab === 'modern' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
                <h3 className="text-sm font-bold text-emerald-300 mb-1">
                  1. Modern Ludo Presentation
                </h3>
                <p>
                  Modern visual board with cyber-illumination, glowing neon paths, and animated dice engines, while preserving the authentic Ludo gameplay rules.
                </p>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-white">
                  2. Same Authentic Ludo Rules
                </h3>
                <p>
                  Modern Ludo follows the exact same gameplay rules as Classic Ludo:
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li><strong>1 is required to enter:</strong> A roll of 1 deploys your piece from the base pod.</li>
                  <li><strong>Capture mechanics:</strong> Send opposing units back to their base.</li>
                  <li><strong>Safe Zones & Blockades:</strong> Same strategic defense rules apply.</li>
                  <li><strong>Nexus Home:</strong> Bring all 4 units to the center Nexus to achieve victory.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
