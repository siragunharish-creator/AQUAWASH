import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('admin@aquashinecarcare.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid administrator credentials. Access denied.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-black text-gray-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Left Column: Luxury Automotive Visual Showcase */}
      <div className="hidden lg:relative lg:flex flex-col justify-between p-12 bg-neutral-950 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=85"
          alt="AquaShine Detailing Luxury Bay"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              AquaShine<span className="text-sky-400 ml-1">Care</span>
            </span>
          </Link>

          <span className="text-xs uppercase tracking-widest font-bold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-3 py-1 rounded-full">
            Admin Console v2.6
          </span>
        </div>

        <div className="relative z-10 max-w-lg space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Automotive Management & Booking Engine
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Real-time control center for appointment reservations, WhatsApp Cloud API tracking, vehicle pricing configuration, and media assets in Chennai.
          </p>
        </div>

        <div className="relative z-10 text-xs text-neutral-400 border-t border-neutral-800 pt-6 flex justify-between items-center">
          <span>AquaShine Car Care • Chennai, Tamil Nadu</span>
          <span>Protected by AES-256 Auth</span>
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
            title="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-600" />
            )}
          </button>
        </div>

        {/* Center Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-10 space-y-8">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Administrator Sign In
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-1">
              Authenticate with your credentials to access the Chennai operations dashboard.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-neutral-400 mb-2">
                Administrator Email / Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
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
              <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1.5">
                Default Demo Password: <code className="bg-gray-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-sky-500">AquaShineAdmin2026!</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-600/25 flex items-center justify-center transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
