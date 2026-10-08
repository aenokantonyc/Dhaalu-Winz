import React, { useState } from 'react';
import { X, LogIn, AlertCircle } from 'lucide-react';
import { audio } from '../utils/audio';

interface JoinTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (code: string) => void;
  errorMessage?: string | null;
}

export const JoinTeamModal: React.FC<JoinTeamModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom,
  errorMessage,
}) => {
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setLocalError('Please enter a team code');
      return;
    }
    audio.playClick();
    onJoinRoom(clean);
  };

  const activeError = errorMessage || localError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
          <LogIn className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2">
          JOIN TEAM
        </h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Enter the unique team code provided by your friend to join their lobby.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              ENTER TEAM CODE
            </label>
            <input
              type="text"
              autoFocus
              value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase());
                if (localError) setLocalError('');
              }}
              placeholder="e.g. LUDO-7X92"
              maxLength={12}
              className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-4 py-3 text-center text-lg tracking-widest font-mono text-white outline-none transition-colors uppercase placeholder:text-slate-600"
            />
            {activeError && (
              <div className="flex items-center gap-2 text-xs text-red-400 mt-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{activeError}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wide rounded-xl transition-all shadow-md cursor-pointer mt-2"
          >
            JOIN TEAM
          </button>
        </form>
      </div>
    </div>
  );
};
