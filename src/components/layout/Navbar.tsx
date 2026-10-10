import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Sun,
  Moon,
  Shield,
  Menu,
  X,
  Phone,
  MessageCircle,
  CalendarCheck,
  Search
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';
import { useAuth } from '../../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services & Pricing', path: '/services' },
    { label: 'Book Appointment', path: '/book', highlight: true },
    { label: 'Track Booking', path: '/track' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-black/90 border-b border-gray-200 dark:border-neutral-800 transition-colors duration-200">
      {/* Top micro bar with location and instant contact */}
      <div className="hidden md:flex justify-between items-center px-4 sm:px-8 py-1.5 text-xs text-gray-600 dark:text-neutral-400 border-b border-gray-100 dark:border-neutral-900 bg-gray-50/50 dark:bg-neutral-950/50">
        <div className="flex items-center space-x-6">
          <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
            Open Today: 8:00 AM – 8:00 PM • Chennai Hub & Doorstep
          </span>
          <span>📍 Kandanchavadi, OMR & Velachery Hub, Chennai</span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="tel:+918668181232"
            className="flex items-center hover:text-sky-500 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 mr-1 text-sky-500" />
            +91 86681 81232
          </a>
          <a
            href="https://wa.me/918668181232?text=Hello%20AquaShine%20Chennai,%20I%20would%20like%20to%20inquire%20about%20a%20car%20wash."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity font-medium"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            WhatsApp Quick Chat
          </a>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center">
                AquaShine
                <span className="text-sky-500 ml-1">Care</span>
              </span>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-neutral-400 font-semibold">
                Chennai • Auto Detailing
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map(link => {
              const active = isActive(link.path);
              if (link.highlight) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="ml-2 inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 shadow-md shadow-sky-500/20 hover:shadow-sky-500/35 transition-all duration-200"
                  >
                    <CalendarCheck className="w-4 h-4 mr-1.5" />
                    {link.label}
                  </Link>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                      : 'text-gray-700 dark:text-neutral-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-neutral-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Theme Toggle + Admin Icon + Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-sky-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Admin Portal Icon (Shield) */}
            <Link
              to={isAuthenticated ? '/admin' : '/admin/login'}
              className="relative p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-800 transition-colors group"
              title="Admin Portal Login"
            >
              <Shield className="w-5 h-5" />
              {isAuthenticated && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black"></span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-medium ${
                link.highlight
                  ? 'bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-semibold text-center mt-2'
                  : isActive(link.path)
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100 dark:border-neutral-900 flex justify-between items-center px-2">
            <span className="text-xs text-gray-500 dark:text-neutral-400">
              AquaShine Chennai • +91 86681 81232
            </span>
            <Link
              to={isAuthenticated ? '/admin' : '/admin/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-sky-600 dark:text-sky-400 font-semibold flex items-center"
            >
              <Shield className="w-3.5 h-3.5 mr-1" />
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
