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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseAuth, setIsSupabaseAuth] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAuth = async () => {
    setIsLoading(true);
    setAuthError(null);

    // 1. Try restoring Supabase Auth Session
    if (isSupabaseConfigured) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession error:', error.message);
        } else if (session?.user) {
          const verification = await verifyAdminUser(session.user.id);
          if (verification.isAdmin) {
            setUser({
              id: session.user.id,
              email: session.user.email || 'admin@aquashinecarcare.in',
              name: session.user.user_metadata?.full_name || 'AquaShine Administrator',
              role: verification.role || 'admin'
            });
            setIsSupabaseAuth(true);
            setAdminToken(session.access_token);
            setIsLoading(false);
            return;
          } else {
            // User session exists in Supabase Auth but user is NOT an admin
            console.warn('Authenticated user not authorized in public.admin_users:', session.user.id);
            setAuthError(verification.error || 'Your account does not have administrator access.');
            setUser(null);
            clearAdminToken();
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
        setUser({
          email: me.email,
          name: me.name,
          role: me.role
        });
        setIsSupabaseAuth(false);
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
            setUser({
              id: session.user.id,
              email: session.user.email || 'admin@aquashinecarcare.in',
              name: session.user.user_metadata?.full_name || 'AquaShine Administrator',
              role: verification.role || 'admin'
            });
            setIsSupabaseAuth(true);
            setAdminToken(session.access_token);
            setAuthError(null);
          } else {
            setUser(null);
            clearAdminToken();
            setAuthError(verification.error || 'Your account does not have administrator access.');
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          clearAdminToken();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setAuthError(null);

    // 1. If Supabase is configured, use official Supabase Auth
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass
        });

        if (error) {
          setIsLoading(false);
          // Friendly message mapping for Supabase Auth errors
          if (error.message.toLowerCase().includes('email not confirmed')) {
            throw new Error('Email address not confirmed. Please verify your email inbox or disable email confirmations in Supabase Auth.');
          }
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            throw new Error('Invalid email or password. Please verify your Supabase Auth administrator credentials.');
          }
          throw new Error(error.message);
        }

        if (!data.user) {
          setIsLoading(false);
          throw new Error('Authentication succeeded but user profile was not returned.');
        }

        // 2. Verify administrator authorization against public.admin_users
        const verification = await verifyAdminUser(data.user.id);
        if (!verification.isAdmin) {
          await supabase.auth.signOut();
          setIsLoading(false);
          const deniedMsg = verification.error || 'Your account does not have administrator access.';
          setAuthError(deniedMsg);
          throw new Error(deniedMsg);
        }

        setUser({
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.full_name || 'AquaShine Administrator',
          role: verification.role || 'admin'
        });
        setIsSupabaseAuth(true);
        if (data.session?.access_token) {
          setAdminToken(data.session.access_token);
        }
        setIsLoading(false);
        return;
      } catch (err: any) {
        setIsLoading(false);
        throw err;
      }
    }

    // 2. Fallback to server endpoint if publishable key is not set in environment
    try {
      const res = await api.adminLogin(email, pass);
      setUser(res.user);
      setIsSupabaseAuth(false);
    } catch (err: any) {
      const fallbackErr = err.message || 'Administrator sign-in failed. Check server connection or Supabase environment variables.';
      setAuthError(fallbackErr);
      throw new Error(fallbackErr);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (_) {}
    }
    try {
      await api.adminLogout();
    } catch (_) {}
    clearAdminToken();
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
