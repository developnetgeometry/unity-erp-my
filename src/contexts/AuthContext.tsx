import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  ensureFreshToken: () => Promise<Session | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isTokenExpiringSoon = (currentSession: Session | null): boolean => {
    if (!currentSession?.expires_at) return true;
    
    const expiresAt = currentSession.expires_at * 1000; // Convert to milliseconds
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    return expiresAt - now < fiveMinutes;
  };

  const refreshSession = async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.getSession();
      
      console.log('AuthContext - Session refresh:', {
        hasSession: !!newSession,
        userId: newSession?.user?.id,
        error: error?.message
      });

      if (error) throw error;
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
    } catch (error) {
      console.error('AuthContext - Failed to refresh session:', error);
      setSession(null);
      setUser(null);
    }
  };

  const ensureFreshToken = async (): Promise<Session | null> => {
    console.log('AuthContext - Ensuring fresh token...', {
      hasSession: !!session,
      expiringSoon: isTokenExpiringSoon(session)
    });

    if (!session || isTokenExpiringSoon(session)) {
      console.log('AuthContext - Refreshing token...');
      await refreshSession();
      
      // Get the updated session
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      return freshSession;
    }
    
    return session;
  };

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        console.log('AuthContext - Initial session:', {
          hasSession: !!initialSession,
          userId: initialSession?.user?.id,
          email: initialSession?.user?.email,
          error: error?.message
        });

        if (error) throw error;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        // User activation now handled by database trigger during registration
      } catch (error) {
        console.error('AuthContext - Session initialization error:', error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      console.log('AuthContext - Auth state changed:', {
        event: _event,
        hasSession: !!newSession,
        userId: newSession?.user?.id
      });

      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (!newSession) {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading, refreshSession, ensureFreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
