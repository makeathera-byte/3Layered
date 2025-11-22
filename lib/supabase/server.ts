// Supabase client for server-side operations (API routes, Server Components)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase server environment variables');
}

// Service role client - bypasses RLS, use carefully!
// Note: Types temporarily disabled due to Next.js 15 type inference issues
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper to verify admin role
export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return data.role === 'admin';
}

// Helper to get or create user profile
export async function getOrCreateUserProfile(authUser: any) {
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (existingUser) return existingUser;

  // Create new user profile
  const { data: newUser, error } = await supabaseAdmin
    .from('users')
    .insert({
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name,
      photo_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
      google_id: authUser.user_metadata?.provider_id,
      role: 'customer'
    })
    .select()
    .single();

  if (error) throw error;
  return newUser;
}

