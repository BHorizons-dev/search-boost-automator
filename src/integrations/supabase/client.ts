
import { createClient } from '@supabase/supabase-js';
import type { Database as SupabaseDatabase } from './types';

// Extending the database types to include our new tables
// This is necessary since we can't edit the auto-generated types.ts file
interface ExtendedDatabase extends SupabaseDatabase {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          company?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      client_websites: {
        Row: {
          id: string;
          client_id: string;
          website_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          website_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          client_id?: string;
          website_id?: string;
          created_at?: string | null;
        };
      };
      websites: {
        Row: {
          id: string;
          name: string;
          domain: string;
          user_id: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          domain: string;
          user_id: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string;
          user_id?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      keywords: {
        Row: {
          id: string;
          keyword: string;
          website_id: string;
          importance: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          keyword: string;
          website_id: string;
          importance?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          keyword?: string;
          website_id?: string;
          importance?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      rankings: {
        Row: {
          id: string;
          keyword_id: string;
          position: number;
          search_engine: string;
          url: string | null;
          recorded_at: string | null;
        };
        Insert: {
          id?: string;
          keyword_id: string;
          position: number;
          search_engine: string;
          url?: string | null;
          recorded_at?: string | null;
        };
        Update: {
          id?: string;
          keyword_id?: string;
          position?: number;
          search_engine?: string;
          url?: string | null;
          recorded_at?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          website_id: string;
          title: string;
          description: string | null;
          task_type: string;
          priority: string;
          status: string;
          completed_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          website_id: string;
          title: string;
          description?: string | null;
          task_type: string;
          priority?: string;
          status?: string;
          completed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          website_id?: string;
          title?: string;
          description?: string | null;
          task_type?: string;
          priority?: string;
          status?: string;
          completed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    } & SupabaseDatabase['public']['Tables'];
    Views: SupabaseDatabase['public']['Views'];
    Functions: SupabaseDatabase['public']['Functions'];
    Enums: SupabaseDatabase['public']['Enums'];
    CompositeTypes: SupabaseDatabase['public']['CompositeTypes'];
  };
}

// Supabase URL and key for the SEO Boost project
const SUPABASE_URL = "https://hsmhhcio1tmcpv4y.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzbWhoY2lvMXRtY3B2NHkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNTIyMDAwMCwiZXhwIjoyMDMwNzk2MDAwfQ.nZSCGLRpYmV3jmyQOYHeqEnluoRnhLeS6kaVG7Y_C4w";

// Create the Supabase client with proper configuration options
export const supabase = createClient<ExtendedDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  // Use the public schema
  db: {
    schema: 'public'
  },
  // Remove any problematic headers
  global: {
    headers: {}
  }
});
