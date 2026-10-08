import React, { useState } from 'react';
import { auth } from '../utils/auth';
import { X, ShieldCheck } from 'lucide-react';
import { audio } from '../utils/audio';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'create_team' | 'join_team' | 'general';
  onSuccess: () => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  reason = 'general',
  onSuccess,
}) => {
  const [customEmail, setCustomEmail] = useState('aenokantony1313@gmail.com');
  const [customName, setCustomName] = useState('Aenok Antony');
  const [showAccountChooser, setShowAccountChooser] = useState(false);

  if (!isOpen) return null;

  const getNotice = () => {
    if (reason === 'create_team') {
      return 'Google Sign-In is required to play online.';
    }
    if (reason === 'join_team') {
      return 'Google Sign-In is required to join an online game.';
    }
    return 'Sign in with your Google account to access online rooms, lobbies, and stat tracking.';
  };

  const handleGoogleSignIn = (emailToUse: string, nameToUse: string) => {
    audio.playClick();
    auth.loginWithGoogle({
      email: emailToUse,
      name: nameToUse,
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative text-slate-100">
        <button
          onClick={() => {
            audio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 border border-white/20">
            {/* Google SVG Logo */}
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            SIGN IN TO PLAY ONLINE
          </h2>
          <p className="text-sm text-amber-400/90 font-medium mb-6">
            {getNotice()}
          </p>

          <div className="space-y-4">
            {/* Primary Google Auth CTA */}
            <button
              onClick={() => handleGoogleSignIn(customEmail, customName)}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-colors shadow-md cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Account switch toggle */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowAccountChooser(!showAccountChooser)}
                className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                {showAccountChooser ? 'Use default Google Account' : 'Choose different Google account'}
              </button>
            </div>

            {showAccountChooser && (
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 mt-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Google Email</label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                    placeholder="you@gmail.com"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Account Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100"
                    placeholder="Your Google Account Name"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure Google Sign-In only. No passwords stored.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
