import React, { useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../firebase';
import { Shield, LogOut, User as UserIcon, Lock, Mail, AlertTriangle, Zap } from 'lucide-react';

interface AuthProps {
  user: any;
}

export default function Auth({ user }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const performLogin = async (loginUser: string, loginPass: string) => {
    setError('');
    setLoading(true);

    try {
      // 1. Try Server-side API authentication first
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: loginUser, password: loginPass, passwordGuess: loginPass })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          window.location.reload();
          return;
        }
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401 || res.status === 429) {
          setError(data.message || 'Invalid username or password.');
          setLoading(false);
          return;
        }
      }

      // 2. Firebase authentication fallback
      await signInWithEmailAndPassword(auth, loginUser, loginPass);
      window.location.reload();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('api-key-not-valid') || msg.includes('configuration') || msg.includes('auth/')) {
        setError('Authentication failed: Incorrect username or password.');
      } else {
        setError(msg.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickAutoLogin = useCallback(async () => {
    setEmail('sylenul');
    setPassword('Nulsyle202616!');
    await performLogin('sylenul', 'Nulsyle202616!');
  }, []);

  // Keyboard shortcut (Ctrl + Shift + A) to automatically sign in
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        handleQuickAutoLogin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleQuickAutoLogin]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    try {
      signOut(auth);
    } catch {}
    localStorage.removeItem('x2shows_guest_user');
    localStorage.removeItem('x2shows_auth_token');
    window.location.reload();
  };

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/50 backdrop-blur-md">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <UserIcon className="w-4 h-4" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-medium text-slate-200 truncate max-w-[140px]">{user.email || user.displayName || 'User'}</p>
          <p className="text-[10px] text-emerald-400 font-mono">Authenticated</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Subtle glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20 text-white">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Sign In Required
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your credentials to access the secure streaming dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email or Username</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="sylenul or you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-950 px-2 text-slate-500 font-mono">or shortcut</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickAutoLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-cyan-400 hover:text-cyan-300 font-mono text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 group"
          title="Auto Sign-In as sylenul (Ctrl+Shift+A)"
        >
          <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>⚡ Quick Auto Sign-In (sylenul)</span>
          <span className="ml-auto text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Ctrl+Shift+A</span>
        </button>

      </div>
    </div>
  );
}
