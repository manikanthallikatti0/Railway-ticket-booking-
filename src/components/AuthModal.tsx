import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { MockUser } from '../types/railway';

interface AuthModalProps {
  currentUser: MockUser | null;
  onClose: () => void;
  onSignIn: (user: MockUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ currentUser, onClose, onSignIn }) => {
  const [mode, setMode] = useState<'SIGNIN' | 'SIGNUP'>('SIGNIN');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'SIGNUP' && name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (mode === 'SIGNUP' && phone.replace(/\D/g, '').length !== 10) {
      setError('Please enter a 10-digit mobile number.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    const derivedName =
      mode === 'SIGNUP'
        ? name.trim()
        : email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    onSignIn({
      id: `usr-${Date.now()}`,
      name: derivedName || 'RailVista Traveler',
      email: email.trim(),
      phone: phone.replace(/\D/g, '') || '9876543210',
    });
    onClose();
  };

  const handleDemoUser = () => {
    onSignIn({
      id: 'usr-demo',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '9876543210',
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 id="auth-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
            {mode === 'SIGNIN' ? 'Sign In to RailVista' : 'Create RailVista Account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Mock session authentication for faster passenger contact auto-fill.
        </p>

        {/* Mode toggle */}
        <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => {
              setMode('SIGNIN');
              setError(null);
            }}
            className={`h-9 rounded-md text-xs font-semibold transition-colors ${
              mode === 'SIGNIN'
                ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('SIGNUP');
              setError(null);
            }}
            className={`h-9 rounded-md text-xs font-semibold transition-colors ${
              mode === 'SIGNUP'
                ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3.5">
          {mode === 'SIGNUP' && (
            <div>
              <label htmlFor="auth-name" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {mode === 'SIGNUP' && (
            <div>
              <label htmlFor="auth-phone" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mobile Number
              </label>
              <input
                id="auth-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-password" className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {mode === 'SIGNIN' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={handleDemoUser}
            className="h-10 w-full rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Continue as Demo User (Aarav Sharma)
          </button>
        </div>
      </div>
    </div>
  );
};
