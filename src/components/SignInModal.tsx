import React, { useState } from 'react';
import { Member } from '../types';
import { X, UserCheck, Search, Sparkles, Mail, ShieldCheck } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSelectMember: (member: Member) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  members,
  onSelectMember,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const query = emailInput.trim().toLowerCase();
    if (!query) {
      setError('Please enter your registered university or personal email.');
      return;
    }

    const matched = members.find(
      (m) =>
        m.contact?.email?.toLowerCase() === query ||
        m.name.toLowerCase() === query
    );

    if (!matched) {
      setError(
        'No profile found with this email. If you have not registered yet, click "Create Student Profile".'
      );
      return;
    }

    onSelectMember(matched);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#180c32] border border-purple-600/40 rounded-3xl p-6 shadow-2xl shadow-purple-950/90 text-white space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-purple-800/40 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-900/60 border border-purple-500/40 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-white">Member Sign In</h3>
              <p className="text-xs text-purple-300">Activate your profile on this device</p>
            </div>
          </div>
          <button
            id="btn-close-signin-modal"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-purple-900/40 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Registered Email or Name
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
              <input
                id="input-signin-email"
                type="text"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. blqees10001@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-800/60 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-cyan-400 transition-colors"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-purple-300/70 mt-1">
              Enter the email you provided when submitting your Tuwaiq profile.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-purple-950/60"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-signin"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-purple-950 flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <UserCheck className="w-4 h-4" />
              <span>Activate Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
