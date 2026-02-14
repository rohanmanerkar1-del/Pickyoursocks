import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';

/* =======================
   Types
======================= */

export interface User {
  id: string;
  email: string;

  name?: string;
  username?: string;
  profile_photo?: string;

  sports?: string[];
  region?: string;
  locality?: string;

  dob?: string;
  gender?: string;

  level?: string;
  elo?: number;
  elo_ratings?: Record<string, number>; // Per-sport Elo ratings
  preferred_format?: string;
  experience_years?: number;

  available_days?: string[];
  time_slots?: string[];

  bio?: string;
  achievements?: string[];

  connections?: number;
  reliability_score?: number;
  calibration_games_remaining?: number;
  rating_deviation?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  profileError: string | null; // ADDED

  login: (email: string, password: string) => Promise<void>;
  signup: (
    userData: Pick<User, 'email' | 'name' | 'sports' | 'reliability_score' | 'calibration_games_remaining' | 'rating_deviation' | 'elo' | 'elo_ratings' | 'region'>,
    password: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/* =======================
   Context
======================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =======================
   Provider
======================= */

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null); // ADDED

  /* -----------------------
     Fetch profile (SIMPLIFIED)
  ----------------------- */
  const fetchProfileSafe = async (userId: string, retries = 3, delay = 1000) => {
    setProfileError(null);
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`fetching profile attempt ${i + 1} for ${userId}`);

        // Direct fetch matches Diagnostic logic exactly
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;

        console.log('Profile fetch success:', data?.username);
        return data;

      } catch (err: any) {
        console.warn(`PROFILE FETCH ATTEMPT ${i + 1} FAILED:`, err.message || err);

        if (i === retries - 1) {
          console.error('ALL PROFILE FETCH ATTEMPTS FAILED');
          setProfileError(`Failed to load profile: ${err.message || 'Unknown error'}`);
          return null;
        }
        // Wait before retrying
        await new Promise(res => setTimeout(res, delay * (i + 1)));
      }
    }
    return null;
  };

  /* -----------------------
     Init Auth (REFRESH SAFE)
  ----------------------- */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Check active session
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!mounted) return;

        if (session?.user) {
          console.log('SESSION FOUND:', session.user.email);

          // ADDED: Small delay to ensure session is "hot" (fixes race condition)
          await new Promise(r => setTimeout(r, 500));

          const profilePromise = fetchProfileSafe(session.user.id);
          const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(undefined), 15000));

          const profile = await Promise.race([profilePromise, timeoutPromise]);

          if (mounted) {
            // Only fall back to defaults if profile is explicitly null (likely new user)
            // If undefined (timeout) or error, we might want to be careful, but for INIT we must set something.
            setUser({
              id: session.user.id,
              email: session.user.email!,
              ...(profile || { elo: 1200 }),
            });
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('AUTH INIT FAILED:', err);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log('AUTH INIT DONE - LOADING FALSE');
          setIsLoading(false);
        }
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('AUTH EVENT:', _event);

      if (!mounted) return;

      if (session?.user) {
        const sbUser = session.user;

        // RACE CONDITION FIX FOR EVENT LISTENER TOO
        const profilePromise = fetchProfileSafe(sbUser.id);
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(undefined), 10000));

        const profile = await Promise.race([profilePromise, timeoutPromise]);

        if (mounted) {
          setUser(prev => {
            if (profile) {
              return {
                id: sbUser.id,
                email: sbUser.email!,
                ...profile,
              };
            }
            // If profile fetch failed, but we have a user (prev), KEEP PREV!
            if (prev) {
              console.warn('Profile refresh failed - keeping existing user state.');
              return prev;
            }
            // No previous state? Then we have to use defaults.
            return {
              id: sbUser.id,
              email: sbUser.email!,
              elo: 1200,
            };
          });
        }
      } else {
        if (mounted) setUser(null);
      }

      if (mounted) setIsLoading(false);
    });

    // DOOMSDAY FALLBACK: Force loading to stop after 8 seconds if everything else hangs
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ Safety timer triggered: Forcing app load.');
        setIsLoading(false);
      }
    }, 8000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  /* -----------------------
     Email Login
  ----------------------- */
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  /* -----------------------
     Signup
  ----------------------- */
  const signup = async (
    userData: Pick<User, 'email' | 'name' | 'sports' | 'reliability_score' | 'calibration_games_remaining' | 'rating_deviation' | 'elo' | 'elo_ratings' | 'region'>,
    password: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password,
      options: {
        data: { name: userData.name },
      },
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: userData.name,
        sports: userData.sports ?? [],
        elo: userData.elo ?? 800, // Default to 800 if not provided
        reliability_score: userData.reliability_score ?? 100,
        calibration_games_remaining: userData.calibration_games_remaining ?? 5,
        rating_deviation: userData.rating_deviation ?? 350,
        elo_ratings: userData.elo_ratings ?? { [userData.sports?.[0] || 'general']: userData.elo ?? 800 },
        region: userData.region, // NEW: Save region
      });
    }
  };

  /* -----------------------
     Google OAuth
  ----------------------- */
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/feed`,
      },
    });
    if (error) throw error;
  };

  /* -----------------------
     Logout
  ----------------------- */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  /* -----------------------
     Update Profile
  ----------------------- */
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    setUser(prev => (prev ? { ...prev, ...updates } : prev));
  };

  /* -----------------------
     Refresh Profile
  ----------------------- */
  const refreshProfile = async () => {
    if (!user) return;

    const profile = await fetchProfileSafe(user.id);

    if (profile) {
      setUser(prev => (prev ? { ...prev, ...profile } : prev));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        profileError, // EXPOSE ERROR
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =======================
   Hook
======================= */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
