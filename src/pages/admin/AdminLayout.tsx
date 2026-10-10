import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  CalendarCheck,
  Tag,
  FileEdit,
  Image,
  Settings,
  MessageCircle,
  Shield,
  LogOut,
  Sun,
  Moon,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';

export const AdminLayout: React.FC = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dedicated loading state to prevent flash or premature redirects
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black text-gray-900 dark:text-neutral-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900 dark:text-white">Verifying Admin Authorization</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">Connecting to Supabase...</p>
          </div>
        </div>
      </div>
    );
  }

  // Auth gate check with declarative Navigate
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { label: 'Services & Pricing', path: '/admin/services', icon: Tag },
    { label: 'Website Content', path: '/admin/content', icon: FileEdit },
    { label: 'Media & Gallery', path: '/admin/gallery', icon: Image },
    { label: 'Business Settings', path: '/admin/settings', icon: Settings },
    { label: 'WhatsApp Logs', path: '/admin/whatsapp', icon: MessageCircle },
    { label: 'Account & Security', path: '/admin/account', icon: Shield }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 flex transition-colors duration-200">
      {/* ----------------------------------------------------------- */}
      {/* SIDEBAR (DESKTOP)                                           */}
      {/* ----------------------------------------------------------- */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-neutral-800">
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-neutral-900">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-gray-900 dark:text-white">
                AquaShine<span className="text-sky-500">Care</span>
              </span>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-900'
                }`}
              >
                <Icon className={`w-4 h-4 mr-3 ${active ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Current user badge & Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-neutral-900 space-y-2">
          <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-neutral-900 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Authenticated As</p>
            <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.email || 'Administrator'}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ----------------------------------------------------------- */}
      {/* MAIN CONTENT AREA                                           */}
      {/* ----------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-20 bg-white dark:bg-black border-b border-gray-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-300"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
              {navItems.find(i => isActive(i.path))?.label || 'AquaShine Console'}
            </h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-neutral-300 border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Public Website
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-sky-600" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* MOBILE DRAWER SIDEBAR                                       */}
      {/* ----------------------------------------------------------- */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          <div className="relative w-72 bg-white dark:bg-black border-r border-gray-200 dark:border-neutral-800 flex flex-col justify-between p-6 z-10">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-neutral-900">
                <span className="font-extrabold text-base">AquaShine Admin</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? 'bg-sky-600 text-white'
                          : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-neutral-900 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold text-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
