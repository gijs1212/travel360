import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Role = 'uploader' | 'commenter';

export interface Profile {
  id: string;
  username: string;
  email: string;
  role: Role;
  display_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (payload: { username: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile', error);
      return;
    }
    setProfile(data as Profile);
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      const {
        data: { session: initialSession }
      } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(initialSession);
      await loadProfile(initialSession?.user ?? null);
      if (mounted) {
        setLoading(false);
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      await loadProfile(newSession?.user ?? null);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (identifier: string, password: string) => {
    let email = identifier.trim();

    if (!identifier.includes('@')) {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier.trim())
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data?.email) {
        throw new Error('Gebruiker niet gevonden');
      }
      email = data.email;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
    }
  }, []);

  const signUp = useCallback(
    async ({ username, email, password }: { username: string; email: string; password: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            role: 'commenter'
          }
        }
      });

      if (error) {
        throw error;
      }

      const newUser = data.user;
      if (newUser) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: newUser.id,
          username,
          email,
          role: 'commenter'
        });
        if (profileError) {
          throw profileError;
        }
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile: async () => loadProfile(session?.user ?? null)
    }),
    [session, profile, loading, signIn, signUp, signOut, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
