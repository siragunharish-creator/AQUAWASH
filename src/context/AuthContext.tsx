import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, checkIsAdmin, isSupabaseConfigured, ADMIN_UUID } from '../lib/supabase.js';
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
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSupabaseAuth, setIsSupabaseAuth] = useState<boolean>(false);

  const checkAuth = async () => {
    setIsLoading(true);

    // 1. Try restoring Supabase Auth Session
    if (isSupabaseConfigured) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!error && session?.user) {
          const authorized = await checkIsAdmin(session.user.id);
          if (authorized) {
            setUser({
              id: session.user.id,
              email: session.user.email || 'admin@aquashinecarcare.in',
              name: session.user.user_metadata?.full_name || 'AquaShine Administrator',
              role: 'admin'
            });
            setIsSupabaseAuth(true);
            setAdminToken(session.access_token);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Supabase getSession check failed:', err);
      }
    }

    // 2. Check local fallback token if Supabase keys are not set
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
          const authorized = await checkIsAdmin(session.user.id);
          if (authorized) {
            setUser({
              id: session.user.id,
              email: session.user.email || 'admin@aquashinecarcare.in',
              name: session.user.user_metadata?.full_name || 'AquaShine Administrator',
              role: 'admin'
            });
            setIsSupabaseAuth(true);
            setAdminToken(session.access_token);
          } else {
            setUser(null);
            clearAdminToken();
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

    // 1. If Supabase is configured, use official Supabase Auth
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass
      });

      if (error) {
        setIsLoading(false);
        throw new Error(error.message);
      }

      if (!data.user) {
        setIsLoading(false);
        throw new Error('Authentication succeeded but user profile was not returned.');
      }

      // Check whether this user is registered as an admin
      const isAuthorized = await checkIsAdmin(data.user.id);
      if (!isAuthorized) {
        await supabase.auth.signOut();
        setIsLoading(false);
        throw new Error('Access denied: This Supabase account is not authorized in public.admin_users.');
      }

      setUser({
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.full_name || 'AquaShine Administrator',
        role: 'admin'
      });
      setIsSupabaseAuth(true);
      if (data.session?.access_token) {
        setAdminToken(data.session.access_token);
      }
      setIsLoading(false);
      return;
    }

    // 2. Fallback to server endpoint if publishable key is pending
    try {
      const res = await api.adminLogin(email, pass);
      setUser(res.user);
      setIsSupabaseAuth(false);
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
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isLoading,
        isSupabaseAuth,
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
