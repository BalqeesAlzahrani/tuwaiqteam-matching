import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  Lock,
  Mail,
  ShieldCheck,
  Loader2,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
} from 'lucide-react';
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
} from '../lib/authService';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: User) => void;
  initialMode?: 'signin' | 'signup';
  promptMessage?: string;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
  promptMessage,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      let user: User;
      if (mode === 'signup') {
        user = await registerWithEmail(trimmedEmail, password);
      } else {
        user = await signInWithEmail(trimmedEmail, password);
      }
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#180c32] border border-purple-600/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-purple-950/90 text-white space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-800/40 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-900/60 border border-purple-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {mode === 'signup' ? 'Create Tuwaiq Account' : 'Member Sign In'}
              </h3>
              <p className="text-xs text-purple-300">
                {mode === 'signup'
                  ? 'Join the Tuwaiq Club talent ecosystem'
                  : 'Sign in with Firebase Authentication'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-signin-modal"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-purple-900/40 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt note if provided */}
        {promptMessage && (
          <div className="p-3 rounded-2xl bg-purple-900/30 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{promptMessage}</span>
          </div>
        )}

        {/* Google One-Click Sign In */}
        <div className="space-y-3">
          <button
            id="btn-google-signin"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            )}
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-purple-800/60" />
            <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
              or use email
            </span>
            <div className="flex-1 h-px bg-purple-800/60" />
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
              <input
                id="input-auth-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-cyan-400 transition-colors"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
              <input
                id="input-auth-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-cyan-400 transition-colors"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-300 animate-in fade-in">
              {error}
            </div>
          )}

          <button
            id="btn-submit-email-auth"
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-950 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In with Email</span>
              </>
            )}
          </button>
        </form>

        {/* Switch between Sign In and Sign Up */}
        <div className="pt-2 text-center border-t border-purple-900/40">
          {mode === 'signup' ? (
            <p className="text-xs text-purple-300">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="font-bold text-cyan-400 hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-xs text-purple-300">
              First time here?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-bold text-cyan-400 hover:underline"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
