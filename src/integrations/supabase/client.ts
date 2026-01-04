// Supabase client configured for external project
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Hardcoded external Supabase credentials (bypassing .env which has Lovable Cloud values)
const SUPABASE_URL = "https://sddgbbefukcqcxwywdmk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZGdiYmVmdWtjcWN4d3l3ZG1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NjE5NzAsImV4cCI6MjA4MzAzNzk3MH0.wHsN3BOIDIp00A1lM7e40dZ-uWOfKdZPHv8gFDsPVUY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
