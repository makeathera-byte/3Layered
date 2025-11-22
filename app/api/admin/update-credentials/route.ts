import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { oldEmail, newEmail, newPassword } = await request.json();

    if (!oldEmail || !newEmail || !newPassword) {
      return NextResponse.json(
        { error: 'Old email, new email, and new password required' },
        { status: 400 }
      );
    }

    // Find the admin user by old email
    const { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', oldEmail.toLowerCase().trim())
      .eq('role', 'admin')
      .single();

    if (findError || !user) {
      return NextResponse.json(
        { error: 'Admin user not found with the provided email' },
        { status: 404 }
      );
    }

    // Update the admin user with new email and password
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        email: newEmail.toLowerCase().trim(),
        password_hash: newPassword, // In production, use bcrypt to hash this!
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', (user as any).id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully',
      user: {
        id: (updatedUser as any).id,
        email: (updatedUser as any).email,
        full_name: (updatedUser as any).full_name,
        role: (updatedUser as any).role
      }
    });
  } catch (error: any) {
    console.error('Update credentials error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

