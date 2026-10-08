import React, { useState } from 'react';
import { UserProfile } from '../types/game';
import { auth, GoogleUser } from '../utils/auth';
import { X, User, Trophy, Flame, Swords, Calendar, Edit2, Check } from 'lucide-react';
import { audio } from '../utils/audio';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  googleUser: GoogleUser | null;
}

const AVATAR_OPTIONS = ['👑', '⭐', '🛡️', '💎', '🎯', '⚡', '🐉', '🦁', '🚀', '🔥'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  googleUser,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.displayName || '');

  if (!isOpen || !profile) return null;

  const winPercentage =
    profile.gamesPlayed > 0
      ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100)
      : 0;

  const handleSaveName = () => {
    if (newName.trim()) {
      audio.playClick();
      auth.setPlayerName(newName.trim());
      setEditingName(false);
    }
  };

  const handleSelectAvatar = (avatar: string) => {
    audio.playClick();
    auth.setAvatar(avatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative text-slate-100 my-8 max-h-[90vh] flex flex-col">
        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold tracking-tight text-white mb-6">
          PLAYER PROFILE
        </h2>

        <div className="overflow-y-auto pr-1 space-y-6">
          {/* Identity & Avatar Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-3xl flex items-center justify-center border border-amber-500/40 shrink-0">
              {profile.avatar || '👑'}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      maxLength={15}
                      className="bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg text-sm text-white outline-none"
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-1 bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-lg font-bold text-white">
                      {profile.displayName || 'Set Player Name'}
                    </span>
                    <button
                      onClick={() => {
                        setNewName(profile.displayName);
                        setEditingName(true);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Private identity stored internally only */}
              <div className="text-[11px] text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <span>Google Account Linked (Private):</span>
                <span className="font-mono text-slate-400">{googleUser?.email}</span>
              </div>
            </div>
          </div>

          {/* Change Avatar */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              SELECT AVATAR
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map(av => (
                <button
                  key={av}
                  onClick={() => handleSelectAvatar(av)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-all cursor-pointer ${
                    profile.avatar === av
                      ? 'bg-amber-500/20 border-amber-500 scale-110 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Player Statistics Grid */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              STATISTICS
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Played</span>
                <span className="text-lg font-bold text-white font-mono">{profile.gamesPlayed}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Victories</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{profile.gamesWon}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Win Rate</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{winPercentage}%</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 block mb-1">Captures</span>
                <span className="text-lg font-bold text-red-400 font-mono">{profile.totalCaptures}</span>
              </div>
            </div>
          </div>

          {/* Game History */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              GAME HISTORY
            </label>
            {profile.gameHistory.length === 0 ? (
              <div className="p-6 bg-slate-950/60 rounded-xl border border-slate-800 text-center text-xs text-slate-500">
                No matches recorded yet. Complete a match to see your game log.
              </div>
            ) : (
              <div className="space-y-2">
                {profile.gameHistory.map(hist => (
                  <div
                    key={hist.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white capitalize">
                        {hist.boardType.replace('_', ' ')} · {hist.playersCount}P
                      </div>
                      <div className="text-[10px] text-slate-500">{hist.date}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">
                        {hist.captures} Captures
                      </span>
                      {hist.won ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                          WON
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          FINISHED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
