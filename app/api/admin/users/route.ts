import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Helper to verify admin
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  try {
    const token = authHeader.replace('Bearer ', '');
    const sessionData = JSON.parse(token);
    
    if (Date.now() > sessionData.expiresAt) return null;
    
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', sessionData.email)
      .eq('role', 'admin')
      .single();
    
    return user;
  } catch {
    return null;
  }
}

// GET - List all users from Supabase Auth
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Supabase Admin API to list auth users
    // supabaseAdmin already has service role key configured
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Get additional profile data from public.users table
    const userIds = authUsers.map(u => u.id);
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, photo_url, role, mobile, address')
      .in('id', userIds);

    // Create a map of profiles by user id
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }

    // Combine auth user data with profile data
    const users = authUsers.map(authUser => {
      const profile = profileMap.get(authUser.id);
      return {
        id: authUser.id,
        email: authUser.email,
        full_name: profile?.full_name || null,
        photo_url: profile?.photo_url || null,
        role: profile?.role || 'customer',
        mobile: profile?.mobile || null,
        address: profile?.address || null,
        email_verified: authUser.email_confirmed_at ? true : false,
        last_sign_in: authUser.last_sign_in_at,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at,
      };
    });

    // Sort by created_at descending
    users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update user role
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json(
        { error: 'User ID and role required' },
        { status: 400 }
      );
    }

    // Update role in public.users table
    // First check if user exists in public.users, if not create it
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingUser) {
      // Create user record if it doesn't exist
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(id);
      if (!authUser?.user) {
        return NextResponse.json(
          { error: 'User not found in auth' },
          { status: 404 }
        );
      }

      // Insert new user record
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: id,
          email: authUser.user.email,
          role: role,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating user record:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        );
      }
    }

    // Update role
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (error: any) {
    console.error('Error in PUT /api/admin/users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

