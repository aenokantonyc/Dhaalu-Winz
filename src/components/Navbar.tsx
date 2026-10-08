import React from 'react';
import { auth, GoogleUser } from '../utils/auth';
import { User, Volume2, VolumeX, BookOpen, LogOut, Sparkles } from 'lucide-react';
import { audio } from '../utils/audio';

interface NavbarProps {
  onOpenOffline: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
  user: GoogleUser | null;
  playerName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenOffline,
  onOpenHowToPlay,
  onOpenSettings,
  onOpenProfile,
  onOpenLogin,
  user,
  playerName,
}) => {
  const [muted, setMuted] = React.useState(audio.getMuted());

  const toggleSound = () => {
    const next = !muted;
    audio.setMuted(next);
    setMuted(next);
    if (!next) audio.playClick();
  };

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 z-30 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block animate-pulse" />
            Dhaalu Winz
          </span>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              audio.playClick();
              onOpenOffline();
            }}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Play Offline
          </button>
          <button
            onClick={() => {
              audio.playClick();
              onOpenHowToPlay();
            }}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            How to Play
          </button>
          <button
            onClick={() => {
              audio.playClick();
              onOpenSettings();
            }}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            aria-label="Toggle audio"
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  audio.playClick();
                  onOpenProfile();
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors border border-slate-700 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold">
                  {playerName.slice(0, 1).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{playerName}</span>
              </button>
              <button
                onClick={() => {
                  audio.playClick();
                  auth.logout();
                }}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                audio.playClick();
                onOpenLogin();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs tracking-wide uppercase transition-colors cursor-pointer shadow-sm"
            >
              <User className="w-4 h-4" />
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
