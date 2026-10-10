import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, verifyAdminUser, isSupabaseConfigured, ADMIN_UUID } from '../lib/supabase.js';
import { api, getAdminToken, clearAdminToken, setAdminToken } from '../lib/api.js';

export interface AdminUser {
  id?: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  isLoading: boolean;
  isSupabaseAuth: boolean;
  authError: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = 'aquashine_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseAuth, setIsSupabaseAuth] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAuth = async () => {
    setIsLoading(true);
    setAuthError(null);

    // 0. Check persistent local admin session first
    const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed && (parsed.role === 'admin' || parsed.email)) {
          setUser(parsed);
          setIsLoading(false);
          return;
        }
      } catch (_) {}
    }

    // 1. Try restoring Supabase Auth Session
    if (isSupabaseConfigured) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession error:', error.message);
        } else if (session?.user) {
          const verification = await verifyAdminUser(session.user.id);
          if (verification.isAdmin) {
            const adminData: AdminUser = {
              id: session.user.id,
              email: session.user.email || 'harish@aquashinecarcare.in',
              name: session.user.user_metadata?.full_name || 'Harish (Administrator)',
              role: verification.role || 'admin'
            };
            setUser(adminData);
            setIsSupabaseAuth(true);
            setAdminToken(session.access_token);
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminData));
            setIsLoading(false);
            return;
          }
        }
      } catch (err: any) {
        console.warn('Supabase getSession check failed:', err);
      }
    }

    // 2. Check local fallback token if Supabase is offline or not configured
    const token = getAdminToken();
    if (token) {
      try {
        const me = await api.adminGetMe();
        const adminData: AdminUser = {
          email: me.email,
          name: me.name,
          role: me.role
        };
        setUser(adminData);
        setIsSupabaseAuth(false);
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminData));
      } catch (err) {
        clearAdminToken();
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();

    // Subscribe to Supabase auth state changes if configured
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const verification = await verifyAdminUser(session.user.id);
          if (verification.isAdmin) {
            const adminData: AdminUser = {
              id: session.user.id,
              email: session.user.email || 'harish@aquashinecarcare.in',
              name: session.user.user_metadata?.full_name || 'Harish (Administrator)',
              role: verification.role || 'admin'
            };
            setUser(adminData);
            setIsSupabaseAuth(true);
            setAdminToken(session.access_token);
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminData));
            setAuthError(null);
          }
        } else if (event === 'SIGNED_OUT') {
          // Only clear if not in standalone admin mode
          if (!localStorage.getItem(ADMIN_SESSION_KEY)) {
            setUser(null);
            clearAdminToken();
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    setAuthError(null);

    const cleanUser = (identifier || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();

    // 1. Direct credentials verification: username "harish" / password "vshn1996"
    // Also accept admin / AquaShineAdmin2026!
    const isDirectMatch =
      (
        cleanUser === 'harish' ||
        cleanUser === 'harish@aquashinecarcare.in' ||
        cleanUser === 'admin' ||
        cleanUser === 'admin@aquashinecarcare.in' ||
        cleanUser === 'siragunvsh@gmail.com'
      ) &&
      (
        cleanPass === 'vshn1996' ||
        cleanPass === 'aquashineadmin2026!' ||
        cleanPass === 'aquashineadmin2026'
      );

    if (isDirectMatch) {
      const adminData: AdminUser = {
        id: ADMIN_UUID,
        email: cleanUser.includes('@') ? cleanUser : 'harish@aquashinecarcare.in',
        name: cleanUser.includes('harish') ? 'Harish (Administrator)' : 'AquaShine Administrator',
        role: 'admin'
      };

      const token = `aq_adm_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      setAdminToken(token);
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminData));
      setUser(adminData);
      setIsSupabaseAuth(false);
      setIsLoading(false);
      return;
    }

    // 2. Try Supabase Auth if configured and input is an email address
    if (isSupabaseConfigured && cleanUser.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanUser,
          password: cleanPass
        });

        if (!error && data?.user) {
          const verification = await verifyAdminUser(data.user.id);
          if (verification.isAdmin) {
            const adminData: AdminUser = {
              id: data.user.id,
              email: data.user.email || cleanUser,
              name: data.user.user_metadata?.full_name || 'Harish (Administrator)',
              role: verification.role || 'admin'
            };
            setUser(adminData);
            setIsSupabaseAuth(true);
            if (data.session?.access_token) {
              setAdminToken(data.session.access_token);
            }
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminData));
            setIsLoading(false);
            return;
          }
        }
      } catch (_) {}
    }

    // 3. Fallback to server endpoint
    try {
      const res = await api.adminLogin(cleanUser, cleanPass);
      if (res.user) {
        setUser(res.user);
        setIsSupabaseAuth(false);
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(res.user));
        setIsLoading(false);
        return;
      }
    } catch (_) {}

    setIsLoading(false);
    const deniedMsg = 'Invalid username or password. Please verify your credentials and try again.';
    setAuthError(deniedMsg);
    throw new Error(deniedMsg);
  };

  const logout = async () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    clearAdminToken();
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (_) {}
    }
    try {
      await api.adminLogout();
    } catch (_) {}
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isLoading,
        isSupabaseAuth,
        authError,
        login,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
