import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

// This is a one-time setup route - should be deleted after use or protected
export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Generate a UUID for the admin user
    const userId = crypto.randomUUID();

    // Insert admin user
    const userInsert: Database['public']['Tables']['users']['Insert'] = {
      id: userId,
      email: email.toLowerCase().trim(),
      full_name: full_name || 'Admin User',
      role: 'admin',
      password_hash: password // In production, use bcrypt to hash this!
    };
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userInsert as any)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: (data as any).id,
        email: (data as any).email,
        full_name: (data as any).full_name,
        role: (data as any).role
      }
    });
  } catch (error: any) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

