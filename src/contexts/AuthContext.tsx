
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getInitialSession() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          toast({
            title: 'Authentication Error',
            description: error.message || 'Failed to get authentication session',
            variant: 'destructive',
          });
          return;
        }
        
        setSession(data.session);
      } catch (error: any) {
        console.error('Unexpected error during session check:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to the Supabase project. Please check your project credentials.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    // Set up auth state listener first
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
      }
    );

    // Then check for existing session
    getInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: 'Sign In Error',
          description: error.message || 'Failed to sign in',
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Sign In Successful',
        description: 'You have successfully signed in.',
      });
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      // Additional error handling for network errors
      if (error.message === 'Failed to fetch') {
        toast({
          title: 'Connection Error',
          description: 'Unable to connect to authentication service. Please check your Supabase project configuration.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: 'Sign Up Error',
          description: error.message || 'Failed to sign up',
          variant: 'destructive',
        });
        throw error;
      }

      toast({
        title: 'Sign Up Successful',
        description: 'Please check your email to confirm your registration.',
      });
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      // Additional error handling for network errors
      if (error.message === 'Failed to fetch') {
        toast({
          title: 'Connection Error',
          description: 'Unable to connect to authentication service. Please check your Supabase project configuration.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: 'Sign Out Error',
          description: error.message || 'Failed to sign out',
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Sign Out Successful',
        description: 'You have been signed out.',
      });
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
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
