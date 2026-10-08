import React, { useState } from 'react';
import { BoardType } from '../types/game';
import { Plus, LogIn, Play, BookOpen, Settings, User, History, X } from 'lucide-react';
import { audio } from '../utils/audio';

interface DashboardProps {
  isLoggedIn: boolean;
  playerName: string;
  onCreateTeamClick: (board?: BoardType) => void;
  onJoinTeamClick: () => void;
  onPlayOfflineClick: (board?: BoardType) => void;
  onHowToPlayClick: () => void;
  onSettingsClick: () => void;
  onProfileClick: () => void;
  onGameHistoryClick: () => void;
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
}) => {
  const [genericPickerMode, setGenericPickerMode] = useState<'create' | 'offline' | null>(null);

  const handlePickGame = (board: BoardType) => {
    audio.playClick();
    const mode = genericPickerMode;
    setGenericPickerMode(null);
    if (mode === 'create') {
      onCreateTeamClick(board);
    } else if (mode === 'offline') {
      onPlayOfflineClick(board);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero / Action Hub */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Dhaalu Winz
          </h1>
          {isLoggedIn && (
            <p className="text-slate-400 text-sm mt-1">
              Welcome, <strong className="text-amber-400 font-semibold">{playerName}</strong>
            </p>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
          <button
            onClick={() => {
              audio.playClick();
              setGenericPickerMode('create');
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
              setGenericPickerMode('offline');
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            PLAY OFFLINE
          </button>
        </div>
      </div>

      {/* Quick Access Bar */}
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

      {/* Game Cards */}
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-white mb-4">
          Select Game Mode
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Dhayam */}
        <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all group flex flex-col justify-between">
          <div>
            <div className="h-40 bg-gradient-to-br from-amber-950/60 via-stone-900 to-amber-900/40 relative flex items-center justify-center p-4 border-b border-slate-800">
              <div className="w-16 h-16 rounded-xl bg-amber-900/60 border border-amber-600/40 flex items-center justify-center shadow-inner">
                <span className="text-3xl">🎲</span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Dhayam
              </h3>
              <div className="text-xs text-slate-400 space-y-1">
                <div>2 to 4 Players</div>
                <div>Traditional Dayakattai Rules</div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-2">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onPlayOfflineClick('dhayam');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-semibold text-xs transition-colors border border-amber-500/30 hover:border-transparent cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play Dhayam Offline
            </button>
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onCreateTeamClick('dhayam');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Dhayam Team
            </button>
          </div>
        </div>

        {/* 2. Classic Ludo */}
        <div className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all group flex flex-col justify-between">
          <div>
            <div className="h-40 bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/40 relative flex items-center justify-center p-4 border-b border-slate-800">
              <div className="w-16 h-16 rounded-xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center shadow-inner">
                <span className="text-3xl">♟️</span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Classic Ludo
              </h3>
              <div className="text-xs text-slate-400 space-y-1">
                <div>2 to 4 Players</div>
                <div>Customizable Rules</div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-2">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onPlayOfflineClick('classic_ludo');
              }}
              className="w-full py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-300 hover:text-white font-semibold text-xs transition-colors border border-blue-500/30 hover:border-transparent cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play Classic Ludo Offline
            </button>
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onCreateTeamClick('classic_ludo');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Classic Ludo Team
            </button>
          </div>
        </div>

        {/* 3. Modern Ludo */}
        <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all group flex flex-col justify-between">
          <div>
            <div className="h-40 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 relative flex items-center justify-center p-4 border-b border-slate-800">
              <div className="w-16 h-16 rounded-xl bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center shadow-inner">
                <span className="text-3xl">✨</span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2">
                Modern Ludo
              </h3>
              <div className="text-xs text-slate-400 space-y-1">
                <div>2 to 4 Players</div>
                <div>Standard Selected Rules</div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-2">
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onPlayOfflineClick('modern_ludo');
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold text-xs transition-colors border border-emerald-500/30 hover:border-transparent cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play Modern Ludo Offline
            </button>
            <button
              type="button"
              onClick={() => {
                audio.playClick();
                onCreateTeamClick('modern_ludo');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Modern Ludo Team
            </button>
          </div>
        </div>
      </div>

      {/* Generic Picker Modal if clicked from top hero buttons */}
      {genericPickerMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
            <button
              type="button"
              onClick={() => setGenericPickerMode(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {genericPickerMode === 'create' ? 'Create Team' : 'Play Offline'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Select game to open:
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handlePickGame('dhayam')}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-left transition-all cursor-pointer flex items-center gap-3.5 hover:bg-amber-950/20"
              >
                <span className="text-2xl">🎲</span>
                <div>
                  <div className="font-bold text-white text-sm">Dhayam</div>
                  <div className="text-xs text-slate-400">Authentic Dayakattai board</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePickGame('classic_ludo')}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left transition-all cursor-pointer flex items-center gap-3.5 hover:bg-blue-950/20"
              >
                <span className="text-2xl">♟️</span>
                <div>
                  <div className="font-bold text-white text-sm">Classic Ludo</div>
                  <div className="text-xs text-slate-400">Customizable rule system</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePickGame('modern_ludo')}
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left transition-all cursor-pointer flex items-center gap-3.5 hover:bg-emerald-950/20"
              >
                <span className="text-2xl">✨</span>
                <div>
                  <div className="font-bold text-white text-sm">Modern Ludo</div>
                  <div className="text-xs text-slate-400">Standard selected rules</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
