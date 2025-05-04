
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Adding custom types for our new tables that aren't in the auto-generated types
declare module './types' {
  interface Database {
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
      } & Database['public']['Tables'];
    };
  }
}

const SUPABASE_URL = "https://clleydmkgigebktuebdg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbGV5ZG1rZ2lnZWJrdHVlYmRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjE0NzMsImV4cCI6MjA2MTkzNzQ3M30.34BTbQ9LV9CBc8CLixqs9D5HdbJuUKADHR1hJ1iUGQU";

// Create the Supabase client with proper configuration options
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
