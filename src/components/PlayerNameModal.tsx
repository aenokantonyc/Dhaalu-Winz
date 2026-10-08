import React, { useState } from 'react';
import { auth } from '../utils/auth';
import { UserCheck } from 'lucide-react';
import { audio } from '../utils/audio';

interface PlayerNameModalProps {
  isOpen: boolean;
  onComplete: (chosenName: string) => void;
}

export const PlayerNameModal: React.FC<PlayerNameModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) {
      setError('Please enter a player name');
      return;
    }
    if (clean.length > 15) {
      setError('Player name cannot exceed 15 characters');
      return;
    }
    audio.playClick();
    auth.setPlayerName(clean);
    onComplete(clean);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl text-slate-100">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-5">
          <UserCheck className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          CHOOSE YOUR PLAYER NAME
        </h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Your player name will be shown to opponents on the board instead of your Google account name. You can change this later in settings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">
              Player Display Name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. ShadowKing, Aenok, Falcon"
              maxLength={15}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder:text-slate-600"
            />
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-md"
          >
            Confirm Player Name
          </button>
        </form>
      </div>
    </div>
  );
};
