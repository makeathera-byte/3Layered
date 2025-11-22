import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * One-time route to set admin credentials
 * POST /api/admin/set-credentials
 * Body: { email: string, password: string }
 * 
 * This will:
 * 1. Find any existing admin user
 * 2. Update their email and password
 * 3. Or create a new admin if none exists
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const newEmail = email.toLowerCase().trim();
    const newPassword = password;

    // Find any existing admin user
    const { data: admins, error: findError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'admin');

    if (findError) {
      console.error('Error finding admin:', findError);
      return NextResponse.json(
        { error: 'Error finding admin user' },
        { status: 500 }
      );
    }

    // If no admin exists, create one
    if (!admins || admins.length === 0) {
      const userId = crypto.randomUUID();
      const { data: newAdmin, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: newEmail,
          full_name: 'Admin User',
          role: 'admin',
          password_hash: newPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any)
        .select()
        .single();

      if (createError) {
        console.error('Error creating admin:', createError);
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'New admin created successfully',
        user: {
          id: (newAdmin as any).id,
          email: (newAdmin as any).email,
          full_name: (newAdmin as any).full_name,
          role: (newAdmin as any).role
        }
      });
    }

    // Update all existing admin users
    const updates = [];
    for (const admin of admins) {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: newEmail,
          password_hash: newPassword,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', (admin as any).id)
        .select()
        .single();

      if (updateError) {
        console.error(`Error updating admin ${(admin as any).email}:`, updateError);
        continue;
      }

      updates.push(updated);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update any admin users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} admin user(s) successfully`,
      user: {
        id: (updates[0] as any).id,
        email: (updates[0] as any).email,
        full_name: (updates[0] as any).full_name,
        role: (updates[0] as any).role
      }
    });
  } catch (error: any) {
    console.error('Set credentials error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

