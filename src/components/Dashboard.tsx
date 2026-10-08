import React from 'react';
import { BoardType } from '../types/game';
import { Users, Plus, LogIn, Play, BookOpen, Settings, User, History } from 'lucide-react';
import { audio } from '../utils/audio';

interface DashboardProps {
  isLoggedIn: boolean;
  playerName: string;
  onCreateTeamClick: () => void;
  onJoinTeamClick: () => void;
  onPlayOfflineClick: () => void;
  onHowToPlayClick: () => void;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  onGameHistoryClick: () => void;
  onSelectBoardOffline: (board: BoardType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  isLoggedIn,
  playerName,
  onCreateTeamClick,
  onJoinTeamClick,
  onPlayOfflineClick,
  onHowToPlayClick,
  onSettingsClick,
  onProfileClick,
  onGameHistoryClick,
  onSelectBoardOffline,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero / Action Hub */}
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-800">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Dhaalu Winz
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl">
            {isLoggedIn ? (
              <span>Welcome back, <strong className="text-amber-400 font-semibold">{playerName}</strong>! Ready for your next match on Dhaalu Winz?</span>
            ) : (
              <span>Play traditional Dhayam and Ludo with friends online or offline on any device.</span>
            )}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
          <button
            onClick={() => {
              audio.playClick();
              onCreateTeamClick();
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            CREATE TEAM
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onJoinTeamClick();
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            JOIN TEAM
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onPlayOfflineClick();
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            PLAY OFFLINE
          </button>
        </div>
      </div>

      {/* Quick Access Bar for Settings, How to Play, Profile & History */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          onClick={() => {
            audio.playClick();
            onHowToPlayClick();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          How to Play
        </button>

        <button
          onClick={() => {
            audio.playClick();
            onSettingsClick();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          Settings
        </button>

        {isLoggedIn && (
          <>
            <button
              onClick={() => {
                audio.playClick();
                onProfileClick();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-blue-400" />
              Profile
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onGameHistoryClick();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4 text-purple-400" />
              Game History
            </button>
          </>
        )}
      </div>

      {/* The 3 Separate Game Boards */}
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          Select Game Mode
        </h2>
        <p className="text-slate-400 text-xs">
          Three separate board experiences with dedicated authentic rule systems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Dhayam */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all group flex flex-col justify-between">
          <div>
            <div className="h-44 bg-gradient-to-br from-amber-950/60 via-stone-900 to-amber-900/40 relative flex items-center justify-center p-4 border-b border-slate-800 overflow-hidden">
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
              {/* Miniature Dhayam icon & representation */}
              <div className="relative text-center">
                <div className="w-20 h-20 rounded-xl bg-amber-900/60 border border-amber-600/40 flex items-center justify-center shadow-inner mx-auto mb-2">
                  <span className="text-3xl">🎲</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-amber-300/90 bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-800/40">
                  <span>Dayakattai Dice</span>
                  <span>·</span>
                  <span>Fixed Rules</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-1">
                Dhayam
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Traditional Indian strategy game with authentic Kolam cross-board layout, brass stick dice, concentric tracks, and Pazham objective.
              </p>

              <div className="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Players:</span>
                  <span className="font-semibold text-slate-200">2 to 4 Players</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pieces:</span>
                  <span className="font-semibold text-slate-200">Sticks, Pebbles, Shells, Seeds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rules:</span>
                  <span className="font-semibold text-amber-400">Fixed Dhayam Rules</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={() => {
                audio.playClick();
                onSelectBoardOffline('dhayam');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-semibold text-xs transition-colors border border-amber-500/30 hover:border-transparent cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play Dhayam Offline
            </button>
          </div>
        </div>

        {/* 2. Classic Ludo */}
        <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all group flex flex-col justify-between">
          <div>
            <div className="h-44 bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/40 relative flex items-center justify-center p-4 border-b border-slate-800 overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative text-center">
                <div className="w-20 h-20 rounded-xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center shadow-inner mx-auto mb-2">
                  <span className="text-3xl">♟️</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-blue-300/90 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-800/40">
                  <span>Classic Cross</span>
                  <span>·</span>
                  <span>1 to Enter</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-1">
                Classic / Normal Ludo
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Traditional 4-quadrant board with iconic Red, Green, Yellow, Blue home courts, safe zones, blockades, and 1 required to bring pieces out.
              </p>

              <div className="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Players:</span>
                  <span className="font-semibold text-slate-200">2 to 4 Players</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pieces:</span>
                  <span className="font-semibold text-slate-200">4 Pieces per Player</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rules:</span>
                  <span className="font-semibold text-blue-400">Selectable Custom Rules</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={() => {
                audio.playClick();
                onSelectBoardOffline('classic_ludo');
              }}
              className="w-full py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-300 hover:text-white font-semibold text-xs transition-colors border border-blue-500/30 hover:border-transparent cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play Classic Ludo Offline
            </button>
          </div>
        </div>

        {/* 3. Modern Ludo */}
        <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all group flex flex-col justify-between">
          <div>
            <div className="h-44 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 relative flex items-center justify-center p-4 border-b border-slate-800 overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative text-center">
                <div className="w-20 h-20 rounded-xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center shadow-inner mx-auto mb-2">
                  <span className="text-3xl">✨</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-300/90 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800/40">
                  <span>Modern Visuals</span>
                  <span>·</span>
                  <span>Ludo Rules</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-1">
                Modern Ludo
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Futuristic sleek presentation with glowing neon paths, glass aesthetics, and particle animations while preserving authentic Ludo rules.
              </p>

              <div className="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Players:</span>
                  <span className="font-semibold text-slate-200">2 to 4 Players</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pieces:</span>
                  <span className="font-semibold text-slate-200">4 Pieces per Player</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rules:</span>
                  <span className="font-semibold text-emerald-400">Selectable Custom Rules</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={() => {
                audio.playClick();
                onSelectBoardOffline('modern_ludo');
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold text-xs transition-colors border border-emerald-500/30 hover:border-transparent cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play Modern Ludo Offline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
