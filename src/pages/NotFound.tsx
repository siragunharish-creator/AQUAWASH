import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Home, CalendarCheck } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-white dark:bg-black text-gray-900 dark:text-neutral-100">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-500 mx-auto flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-gray-800 dark:text-neutral-200">Page Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Link>
          <Link
            to="/book"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <CalendarCheck className="w-4 h-4 mr-2" />
            Book a Wash
          </Link>
        </div>
      </div>
    </div>
  );
};
