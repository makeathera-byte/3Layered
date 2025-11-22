/**
 * Direct script to update admin credentials in Supabase
 * Run with: node scripts/update-admin.js
 * 
 * Make sure you have .env.local with:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const newEmail = 'makeathera@gmail.com';
const newPassword = 'pp06082008pp';

async function updateAdmin() {
  try {
    console.log('🔍 Looking for admin user...');
    
    // Find any admin user
    const { data: admins, error: findError } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('role', 'admin');

    if (findError) {
      console.error('❌ Error finding admin:', findError);
      return;
    }

    if (!admins || admins.length === 0) {
      console.log('⚠️  No admin user found. Creating new admin...');
      
      // Create new admin
      const userId = randomUUID();
      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: newEmail.toLowerCase().trim(),
          full_name: 'Admin User',
          role: 'admin',
          password_hash: newPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating admin:', createError);
        return;
      }

      console.log('✅ New admin created successfully!');
      console.log('   Email:', newAdmin.email);
      console.log('   ID:', newAdmin.id);
      return;
    }

    // Update existing admin(s)
    console.log(`📝 Found ${admins.length} admin user(s). Updating...`);
    
    for (const admin of admins) {
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          email: newEmail.toLowerCase().trim(),
          password_hash: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', admin.id)
        .select()
        .single();

      if (updateError) {
        console.error(`❌ Error updating admin ${admin.email}:`, updateError);
        continue;
      }

      console.log('✅ Admin credentials updated successfully!');
      console.log('   Old email:', admin.email);
      console.log('   New email:', updated.email);
      console.log('   ID:', updated.id);
    }

    console.log('\n🎉 Done! You can now login with:');
    console.log('   Email:', newEmail);
    console.log('   Password:', newPassword);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateAdmin();

