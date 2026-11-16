import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      setProfile(null);
      return null;
    }

    if (data) {
      const nextProfile = data as Profile;
      setProfile(nextProfile);
      return nextProfile;
    }

    // The database trigger creates profiles during signup. Do not let clients
    // insert or mutate privileged profile fields when a row is unexpectedly missing.
    setProfile(null);
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(data.session);
      if (data.session) {
        await loadProfile(data.session.user.id);
      }
      if (mounted) setLoading(false);
    }

    restoreSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);

      if (event === 'SIGNED_OUT' || !nextSession) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  async function signUp(email: string, password: string, fullName: string) {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    if (data.session && data.user) {
      setSession(data.session);
      await loadProfile(data.user.id);
    }

    setLoading(false);
    return { error: null };
  }

  async function signIn(email: string, password: string) {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      return { error: error.message };
    }

    if (!data.session || !data.user) {
      setLoading(false);
      return { error: 'لم يتم إنشاء جلسة دخول. حاول مرة أخرى.' };
    }

    setSession(data.session);
    const loadedProfile = await loadProfile(data.user.id);

    if (!loadedProfile) {
      setLoading(false);
      return { error: 'تم تسجيل الدخول، لكن تعذر تحميل ملف حسابك. حاول تحديث الصفحة.' };
    }

    setLoading(false);
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
