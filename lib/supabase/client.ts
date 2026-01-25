import { createClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          subscription_type: 'free' | 'premium';
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          subscription_type?: 'free' | 'premium';
          points?: number;
        };
        Update: {
          full_name?: string | null;
          subscription_type?: 'free' | 'premium';
          points?: number;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          exam_type: 'practice' | 'mock';
          questions: any;
          wrong_answers: string[];
          category_scores: any;
          total_questions: number;
          correct_answers: number;
          score: number;
          time_taken: number | null;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          exam_id: string;
          exam_type: 'practice' | 'mock';
          questions: any;
          wrong_answers?: string[];
          category_scores?: any;
          total_questions: number;
          correct_answers: number;
          score: number;
          time_taken?: number | null;
        };
      };
    };
  };
};

// Singleton pattern to prevent multiple client instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

// Simple in-memory lock to replace navigator.locks (which causes AbortError)
const locks: Map<string, Promise<any>> = new Map();
const acquireLock = async <T>(name: string, acquireTimeout: number, fn: () => Promise<T>): Promise<T> => {
  const existing = locks.get(name);
  if (existing) {
    await existing;
  }
  const promise = fn();
  locks.set(name, promise);
  try {
    return await promise;
  } finally {
    locks.delete(name);
  }
};

// Client-side Supabase client
export const createSupabaseClient = () => {
  // Only create client in browser environment
  if (typeof window === 'undefined') {
    return null!;
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'supabase-auth',
      lock: acquireLock,
    },
  });

  return supabaseInstance;
};

// Browser client getter (for use in client components)
export const getSupabase = () => createSupabaseClient();

// Legacy export for backward compatibility
export const supabase = typeof window !== 'undefined' ? createSupabaseClient() : null!;

// Server-side client (for API routes)
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient<Database>(supabaseUrl, supabaseKey);
};
