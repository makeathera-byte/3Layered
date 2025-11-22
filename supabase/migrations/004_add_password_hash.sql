-- Add password_hash column to users table for admin authentication
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);

