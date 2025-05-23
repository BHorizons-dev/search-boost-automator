
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hwpkzvzvyccazpqkhbor.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cGt6dnp2eWNjYXpwcWtoYm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NTMyMTMsImV4cCI6MjA2MjEyOTIxM30.yBh7nyNgieDYnO7pRhi4F2Rl_BgwW8cbBXJh0e2OjwM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Create and export a typed Supabase client with schema configuration
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage
    }
  }
);

// Define custom types to match our database schema
export type TablesInsert = {
  websites: {
    name: string;
    domain: string;
    user_id: string;
    id?: string;
    created_at?: string;
    updated_at?: string;
    seo_health_score?: number | null;
    meta_description_status?: string | null;
    title_tag_status?: string | null;
    last_audit_date?: string | null;
  };
  keywords: {
    website_id: string;
    keyword: string;
    importance?: number;
    id?: string;
    created_at?: string;
    updated_at?: string;
  };
  rankings: {
    keyword_id: string;
    search_engine: string;
    position: number;
    url?: string | null;
    id?: string;
    recorded_at?: string;
  };
  clients: {
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    user_id: string;
    id?: string;
    created_at?: string;
    updated_at?: string;
  };
  client_websites: {
    client_id: string;
    website_id: string;
    id?: string;
    created_at?: string;
  };
  tasks: {
    title: string;
    description?: string | null;
    task_type: string;
    priority: string;
    status: string;
    website_id: string;
    id?: string;
    created_at?: string;
    completed_at?: string | null;
    updated_at?: string | null;
  };
  user_profiles: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    company?: string | null;
    created_at?: string;
    updated_at?: string;
  };
};

// Define custom types for query results
export type TablesSelect = {
  websites: {
    id: string;
    name: string;
    domain: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    seo_health_score: number | null;
    meta_description_status: string | null;
    title_tag_status: string | null;
    last_audit_date: string | null;
  };
  keywords: {
    id: string;
    website_id: string;
    keyword: string;
    importance: number;
    created_at: string;
    updated_at: string;
  };
  rankings: {
    id: string;
    keyword_id: string;
    search_engine: string;
    position: number;
    url: string | null;
    recorded_at: string;
  };
  clients: {
    id: string;
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  client_websites: {
    id: string;
    client_id: string;
    website_id: string;
    created_at: string;
  };
  tasks: {
    id: string;
    title: string;
    description: string | null;
    task_type: string;
    priority: string;
    status: string;
    website_id: string;
    created_at: string;
    completed_at: string | null;
    updated_at: string | null;
  };
  user_profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
    created_at: string;
    updated_at: string;
  };
};

// Type for tables in the public schema
export type Table = keyof TablesSelect;

// Type helper for handling query results from Supabase
export type SupabaseQueryResult<T> = T | null;

// Type helper for Supabase errors
export interface SupabaseError {
  error: true;
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Add type assertion utility to handle potential errors
export function assertData<T>(data: any, fallback: T = [] as unknown as T): T {
  if (!data) {
    console.error('Data validation error: Received null or undefined data');
    return fallback;
  }
  
  if (data.error) {
    console.error('Data validation error:', data.error);
    return fallback;
  }
  
  // Check if data should be an array but isn't
  if (Array.isArray(fallback) && !Array.isArray(data)) {
    console.error('Data validation error: Expected array but received', typeof data);
    return fallback;
  }
  
  return data as T;
}
