import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sun,
  Moon,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { isSupabaseConfigured, SUPABASE_URL } from '../../lib/supabase.js';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, user, logout, authError } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authError) {
      setErrorMsg(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid administrator credentials. Access denied.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-black text-gray-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Left Column: Automotive Visual Showcase */}
      <div className="hidden lg:relative lg:flex flex-col justify-between p-12 bg-neutral-950 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=85"
          alt="AquaShine Detailing Luxury Bay"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40"></div>

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              AquaShine<span className="text-sky-400 ml-1">Care</span>
            </span>
          </Link>

          <span className="text-xs uppercase tracking-widest font-bold text-sky-400 bg-sky-950/80 border border-sky-800/80 px-3 py-1 rounded-full">
            Admin Console
          </span>
        </div>

        <div className="relative z-10 max-w-lg space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Automotive Management & Booking Engine
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Real-time control center for appointment reservations, service rates, before-and-after gallery media, and WhatsApp customer updates in Chennai.
          </p>
        </div>

        <div className="relative z-10 text-xs text-neutral-400 border-t border-neutral-800 pt-6 flex justify-between items-center">
          <span>AquaShine Car Care • Chennai, Tamil Nadu</span>
          <span>Protected by Supabase Auth</span>
        </div>
      </div>

      {/* Right Column: Split Screen Login Form */}
      <div className="flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        {/* Top Header with Theme Switcher & Public Return */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-xs font-semibold text-gray-500 dark:text-neutral-400 hover:text-sky-500 transition-colors"
          >
            ← Back to Public Website
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600" />
            )}
          </button>
        </div>

        {/* Center Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-10 space-y-6">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Administrator Sign In
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
              Sign in with your Supabase administrator account to access the Chennai operations dashboard.
            </p>
          </div>

          {/* Already authenticated banner */}
          {isAuthenticated && user && !isLoading && (
            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 text-xs text-sky-900 dark:text-sky-300 space-y-2">
              <div className="flex items-center space-x-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Already authenticated as: {user.email}</span>
              </div>
              <div className="flex space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-500 transition-colors"
                >
                  Go to Dashboard →
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 font-semibold hover:bg-gray-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Error message alert */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMsg}</p>
                {errorMsg.includes('admin_users') && (
                  <p className="text-[11px] text-red-600/80 dark:text-red-400/80">
                    Tip: Ensure the user's UUID is recorded in the <code>public.admin_users</code> table with <code>role = 'admin'</code> and that RLS policies allow reading.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Environment check banner if Vercel publishable key is not yet set */}
          {!isSupabaseConfigured && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2.5">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />
              <div className="space-y-1">
                <p className="font-bold">Supabase Publishable Key pending in Vercel</p>
                <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                  To authenticate directly against Supabase, configure <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> and <code>VITE_SUPABASE_URL</code> in Vercel Project Settings → Environment Variables.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@aquashinecarcare.in"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                Administrator Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-neutral-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/25 flex items-center justify-center transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-6 cursor-pointer"
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom copyright */}
        <div className="text-center text-xs text-gray-400">
          AquaShine Car Care Admin Console • Chennai Hub Operations
        </div>
      </div>
    </div>
  );
};
