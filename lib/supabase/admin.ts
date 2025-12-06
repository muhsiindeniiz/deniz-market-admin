// lib/supabase/admin.ts
// Admin client for CRUD operations that bypass RLS
// This uses the service role key for admin operations

import { createClient } from '@supabase/supabase-js';

// For client-side admin operations, we need either:
// 1. Service role key (server-side only - NEVER expose to client)
// 2. Properly configured RLS policies for authenticated admin users

// Since this is a client-side admin panel, we'll use the anon key
// BUT we need RLS policies that allow authenticated users to perform admin operations

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for browser-side operations (with RLS)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations only (bypasses RLS)
// Only use this in API routes or server components
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Helper to check if admin client is available
export const isAdminClientAvailable = () => !!supabaseAdmin;
