"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  mobile: string | null;
  address: Address | null;
  photo_url: string | null;
  role: string;
  created_at: string;
}

interface Address {
  flat_number: string;
  colony: string;
  city: string;
  state: string;
  pincode: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, mobile?: string, address?: Address) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile> & { address?: Address | null }) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from public.users table
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile might not exist yet (if trigger hasn't run)
        // This is okay during signup, will be created by trigger
        setProfile(null);
        return;
      }
      setProfile(data as UserProfile);
    } catch (error) {
      // Silently handle - profile will be available after login
      setProfile(null);
    }
  };

  // Handle auth errors (e.g., invalid refresh tokens)
  const handleAuthError = async (error: any) => {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    // Check for token-related errors
    if (
      errorMessage.includes('refresh') ||
      errorMessage.includes('token') ||
      errorMessage.includes('jwt') ||
      errorMessage.includes('invalid refresh token')
    ) {
      console.warn('Auth token error detected, clearing session:', error.message);
      
      // Clear the invalid session
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Clear browser storage to remove stale tokens
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('supabase.auth.token');
          sessionStorage.clear();
        } catch (e) {
          console.error('Error clearing storage:', e);
        }
      }
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          handleAuthError(error);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error getting session:', error);
        handleAuthError(error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        // Handle token refresh events
        if (event === 'TOKEN_REFRESHED') {
          console.log('Auth token refreshed successfully');
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          // Clear any cached data
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('supabase.auth.token');
            } catch (e) {
              console.error('Error clearing storage:', e);
            }
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error in auth state change:', error);
        await handleAuthError(error);
        setLoading(false);
      }
    });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string, mobile?: string, address?: Address) => {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            mobile: mobile || null,
            address: address || null,
          },
        },
      });

      if (error) return { error };

      // Profile will be automatically created by database trigger
      // We don't fetch it here - it will be fetched on first login
      // This avoids timing issues with the trigger

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile> & { address?: Address | null }) => {
    if (!user || !session) return { error: new Error('No user logged in') };

    try {
      // Call API to update both database and auth metadata
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: new Error(data.error || 'Failed to update profile') };
      }

      // Refresh profile to get updated data
      await fetchProfile(user.id);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

