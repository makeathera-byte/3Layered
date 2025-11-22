/**
 * Script to update admin credentials
 * Run with: node scripts/update-admin-credentials.js
 */

const newEmail = 'makeathera@gmail.com';
const newPassword = 'pp06082008pp';

async function updateAdminCredentials() {
  try {
    // First, try to find any existing admin
    const findAdminResponse = await fetch('http://localhost:3000/api/admin/update-credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldEmail: 'admin@example.com', // Try common default
        newEmail: newEmail,
        newPassword: newPassword,
      }),
    });

    if (findAdminResponse.ok) {
      const result = await findAdminResponse.json();
      console.log('✅ Admin credentials updated successfully!');
      console.log('New email:', result.user.email);
      return;
    }

    // If not found, try creating a new admin
    console.log('Admin not found with default email, creating new admin...');
    const createResponse = await fetch('http://localhost:3000/api/admin/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: newEmail,
        password: newPassword,
        full_name: 'Admin User',
      }),
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ New admin created successfully!');
      console.log('Email:', result.user.email);
    } else {
      const error = await createResponse.json();
      console.error('❌ Error:', error.error);
    }
  } catch (error) {
    console.error('❌ Error updating admin credentials:', error.message);
    console.log('\n📝 Manual update required:');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Open the users table');
    console.log('3. Find the admin user (role = "admin")');
    console.log('4. Update email to:', newEmail);
    console.log('5. Update password_hash to:', newPassword);
  }
}

updateAdminCredentials();

