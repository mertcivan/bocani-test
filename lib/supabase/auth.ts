import { getSupabase, Database } from './client';
import type { User, SupabaseClient } from '@supabase/supabase-js';

export interface AuthUser extends User {
  subscription_type?: 'free' | 'premium';
  points?: number;
}

function getSupabaseOrThrow(): SupabaseClient<Database> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase client not available. Check your environment variables.');
  }
  return supabase;
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Sign in with Google
export async function signInWithGoogle() {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    subscription_type: profile?.subscription_type || 'free',
    points: profile?.points || 0,
  } as AuthUser;
}

// Get user profile
export async function getUserProfile(userId: string) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// Update user profile
export async function updateUserProfile(userId: string, updates: {
  full_name?: string;
  subscription_type?: 'free' | 'premium';
  points?: number;
}) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Check if user has premium subscription
export async function hasPremiuSubscription(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile.subscription_type === 'premium';
}

// Reset password
export async function resetPassword(email: string) {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
}

// Update password
export async function updatePassword(newPassword: string) {
  const supabase = getSupabaseOrThrow();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}
