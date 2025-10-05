import { createClient } from '@supabase/supabase-js';

// Supabase configuration for database operations only
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'your_supabase_url_here';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here';

// Create Supabase client for database operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
          last_login: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
          is_active?: boolean;
        };
      };
      creature_sightings: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          latitude: number;
          longitude: number;
          timestamp: string;
          confidence: number;
          description: string | null;
          species: string | null;
          creature_type: string | null;
          key_characteristics: string | null;
          rarity: string | null;
          is_animal: boolean;
          image_uri: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          latitude: number;
          longitude: number;
          timestamp: string;
          confidence?: number;
          description?: string | null;
          species?: string | null;
          creature_type?: string | null;
          key_characteristics?: string | null;
          rarity?: string | null;
          is_animal?: boolean;
          image_uri?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          latitude?: number;
          longitude?: number;
          timestamp?: string;
          confidence?: number;
          description?: string | null;
          species?: string | null;
          creature_type?: string | null;
          key_characteristics?: string | null;
          rarity?: string | null;
          is_animal?: boolean;
          image_uri?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
