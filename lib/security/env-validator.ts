/**
 * Environment Variable Validation
 * Ensures all required environment variables are set
 */

export function validateEnvironmentVariables(): {
  valid: boolean;
  missing: string[];
} {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get environment variable with validation
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

/**
 * Validate Supabase configuration
 */
export function validateSupabaseConfig(): boolean {
  try {
    const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
    const key = getEnv('SUPABASE_SERVICE_ROLE_KEY');
    
    // Basic URL validation
    if (!url.startsWith('https://')) {
      throw new Error('Supabase URL must use HTTPS');
    }
    
    // Key should be a JWT-like string
    if (key.length < 100) {
      throw new Error('Invalid Supabase service role key format');
    }
    
    return true;
  } catch (error) {
    console.error('Supabase configuration validation failed:', error);
    return false;
  }
}

