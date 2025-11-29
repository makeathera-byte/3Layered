import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { logger } from '@/lib/backend/logger';

export async function GET(request: NextRequest) {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'unknown', message: '' },
      environment: { status: 'unknown', message: '' },
      razorpay: { status: 'unknown', message: '' },
    },
    errors: [] as string[],
  };

  try {
    // Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      razorpayKeyId: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      razorpayKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
    };

    const missingEnv = Object.entries(envCheck)
      .filter(([_, exists]) => !exists)
      .map(([key]) => key);

    if (missingEnv.length > 0) {
      healthCheck.checks.environment = {
        status: 'error',
        message: `Missing environment variables: ${missingEnv.join(', ')}`,
      };
      healthCheck.errors.push(`Missing environment variables: ${missingEnv.join(', ')}`);
    } else {
      healthCheck.checks.environment = {
        status: 'ok',
        message: 'All required environment variables are set',
      };
    }

    // Check Razorpay configuration
    if (envCheck.razorpayKeyId && envCheck.razorpayKeySecret) {
      healthCheck.checks.razorpay = {
        status: 'ok',
        message: 'Razorpay credentials configured',
      };
    } else {
      healthCheck.checks.razorpay = {
        status: 'warning',
        message: 'Razorpay credentials not fully configured',
      };
    }

    // Check database connection
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        healthCheck.checks.database = {
          status: 'error',
          message: `Database connection failed: ${error.message}`,
        };
        healthCheck.errors.push(`Database error: ${error.message}`);
        healthCheck.status = 'error';
      } else {
        healthCheck.checks.database = {
          status: 'ok',
          message: 'Database connection successful',
        };
      }
    } catch (dbError: any) {
      healthCheck.checks.database = {
        status: 'error',
        message: `Database connection error: ${dbError.message || 'Unknown error'}`,
      };
      healthCheck.errors.push(`Database connection error: ${dbError.message || 'Unknown error'}`);
      healthCheck.status = 'error';
    }

    // Check critical tables exist
    try {
      const tables = ['orders', 'users', 'products', 'customized_orders'];
      const tableChecks = await Promise.all(
        tables.map(async (table) => {
          const { error } = await supabaseAdmin
            .from(table)
            .select('*')
            .limit(1);
          return { table, exists: !error || error.code !== 'PGRST116' };
        })
      );

      const missingTables = tableChecks
        .filter((check) => !check.exists)
        .map((check) => check.table);

      if (missingTables.length > 0) {
        healthCheck.errors.push(`Missing tables: ${missingTables.join(', ')}`);
        healthCheck.status = 'error';
      }
    } catch (tableError: any) {
      logger.error('Error checking tables', tableError);
    }

    // Determine overall status
    if (healthCheck.errors.length > 0 && healthCheck.status !== 'error') {
      healthCheck.status = 'warning';
    }

    const statusCode = healthCheck.status === 'ok' ? 200 : healthCheck.status === 'warning' ? 200 : 503;

    return NextResponse.json(healthCheck, { status: statusCode });
  } catch (error: any) {
    logger.error('Health check failed', error);
    healthCheck.status = 'error';
    healthCheck.errors.push(`Health check error: ${error.message || 'Unknown error'}`);
    return NextResponse.json(healthCheck, { status: 503 });
  }
}

