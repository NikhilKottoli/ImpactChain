import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create client if we have valid credentials
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Database types
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          token_id: number;
          creator: string;
          title: string;
          description: string;
          ipfs_hash: string;
          likes: number;
          total_earnings: string;
          is_active: boolean;
          ai_labels: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          token_id: number;
          creator: string;
          title: string;
          description: string;
          ipfs_hash: string;
          likes?: number;
          total_earnings?: string;
          is_active?: boolean;
          ai_labels?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          token_id?: number;
          creator?: string;
          title?: string;
          description?: string;
          ipfs_hash?: string;
          likes?: number;
          total_earnings?: string;
          is_active?: boolean;
          ai_labels?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          wallet_address: string;
          username: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          username?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          username?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          post_id: string;
          user_address: string;
          interaction_type: 'like' | 'cheer';
          amount: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_address: string;
          interaction_type: 'like' | 'cheer';
          amount?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_address?: string;
          interaction_type?: 'like' | 'cheer';
          amount?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Typed Supabase client
export const typedSupabase = createClient<Database>(supabaseUrl, supabaseKey);
