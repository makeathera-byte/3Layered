-- Remove the foreign key constraint to auth.users (we'll manage users independently)
-- This allows us to create admin users without Supabase Auth
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Insert admin user (makeathera@gmail.com)
-- Note: In production, password_hash should be bcrypt hashed
INSERT INTO users (id, email, full_name, role, password_hash)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'makeathera@gmail.com',
  'Admin User',
  'admin',
  'pp2008pp'
)
ON CONFLICT (email) DO UPDATE 
SET 
  role = 'admin',
  password_hash = 'pp2008pp',
  full_name = 'Admin User';

