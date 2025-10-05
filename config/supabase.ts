import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      creature_sightings: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          latitude: number;
          longitude: number;
          timestamp: string;
          // AI Analysis data
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
          confidence: number;
          description?: string | null;
          species?: string | null;
          creature_type?: string | null;
          key_characteristics?: string | null;
          rarity?: string | null;
          is_animal: boolean;
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
