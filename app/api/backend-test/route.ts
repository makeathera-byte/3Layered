import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { logger } from '@/lib/backend/logger';
import { getRazorpayInstance, validateRazorpayConfig } from '@/lib/razorpay/config';
import { generateUniqueOrderNumber } from '@/lib/backend/database';

export async function GET(request: NextRequest) {
  const tests = {
    timestamp: new Date().toISOString(),
    results: [] as Array<{ test: string; status: 'pass' | 'fail' | 'warning'; message: string }>,
    summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
  };

  // Test 1: Database Connection
  tests.summary.total++;
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      tests.results.push({
        test: 'Database Connection',
        status: 'fail',
        message: `Failed: ${error.message}`,
      });
      tests.summary.failed++;
    } else {
      tests.results.push({
        test: 'Database Connection',
        status: 'pass',
        message: 'Successfully connected to database',
      });
      tests.summary.passed++;
    }
  } catch (error: any) {
    tests.results.push({
      test: 'Database Connection',
      status: 'fail',
      message: `Error: ${error.message || 'Unknown error'}`,
    });
    tests.summary.failed++;
  }

  // Test 2: Critical Tables Exist
  tests.summary.total++;
  try {
    const criticalTables = ['orders', 'users', 'products', 'customized_orders'];
    const tableChecks = await Promise.all(
      criticalTables.map(async (table) => {
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
      tests.results.push({
        test: 'Critical Tables',
        status: 'fail',
        message: `Missing tables: ${missingTables.join(', ')}`,
      });
      tests.summary.failed++;
    } else {
      tests.results.push({
        test: 'Critical Tables',
        status: 'pass',
        message: `All critical tables exist: ${criticalTables.join(', ')}`,
      });
      tests.summary.passed++;
    }
  } catch (error: any) {
    tests.results.push({
      test: 'Critical Tables',
      status: 'fail',
      message: `Error checking tables: ${error.message || 'Unknown error'}`,
    });
    tests.summary.failed++;
  }

  // Test 3: Environment Variables
  tests.summary.total++;
  const requiredEnvVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'NEXT_PUBLIC_RAZORPAY_KEY_ID': process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    'RAZORPAY_KEY_SECRET': process.env.RAZORPAY_KEY_SECRET,
  };

  const missingEnv = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingEnv.length > 0) {
    tests.results.push({
      test: 'Environment Variables',
      status: 'fail',
      message: `Missing: ${missingEnv.join(', ')}`,
    });
    tests.summary.failed++;
  } else {
    tests.results.push({
      test: 'Environment Variables',
      status: 'pass',
      message: 'All required environment variables are set',
    });
    tests.summary.passed++;
  }

  // Test 4: Razorpay Configuration
  tests.summary.total++;
  try {
    const isValid = validateRazorpayConfig();
    if (isValid) {
      // Try to create instance
      try {
        const razorpay = getRazorpayInstance();
        tests.results.push({
          test: 'Razorpay Configuration',
          status: 'pass',
          message: 'Razorpay is properly configured',
        });
        tests.summary.passed++;
      } catch (error: any) {
        tests.results.push({
          test: 'Razorpay Configuration',
          status: 'warning',
          message: `Config valid but instance creation failed: ${error.message}`,
        });
        tests.summary.warnings++;
      }
    } else {
      tests.results.push({
        test: 'Razorpay Configuration',
        status: 'warning',
        message: 'Razorpay credentials not fully configured',
      });
      tests.summary.warnings++;
    }
  } catch (error: any) {
    tests.results.push({
      test: 'Razorpay Configuration',
      status: 'fail',
      message: `Error: ${error.message || 'Unknown error'}`,
    });
    tests.summary.failed++;
  }

  // Test 5: Order Number Generation
  tests.summary.total++;
  try {
    const orderNumber = await generateUniqueOrderNumber();
    if (orderNumber && orderNumber.length > 0) {
      tests.results.push({
        test: 'Order Number Generation',
        status: 'pass',
        message: `Successfully generated: ${orderNumber}`,
      });
      tests.summary.passed++;
    } else {
      tests.results.push({
        test: 'Order Number Generation',
        status: 'fail',
        message: 'Failed to generate order number',
      });
      tests.summary.failed++;
    }
  } catch (error: any) {
    tests.results.push({
      test: 'Order Number Generation',
      status: 'fail',
      message: `Error: ${error.message || 'Unknown error'}`,
    });
    tests.summary.failed++;
  }

  // Test 6: Database Query Performance
  tests.summary.total++;
  try {
    const startTime = Date.now();
    const { error } = await supabaseAdmin
      .from('orders')
      .select('id')
      .limit(1);
    const duration = Date.now() - startTime;

    if (error && error.code !== 'PGRST116') {
      tests.results.push({
        test: 'Database Query Performance',
        status: 'fail',
        message: `Query failed: ${error.message}`,
      });
      tests.summary.failed++;
    } else {
      const status = duration < 1000 ? 'pass' : duration < 3000 ? 'warning' : 'fail';
      tests.results.push({
        test: 'Database Query Performance',
        status,
        message: `Query completed in ${duration}ms ${duration > 1000 ? '(slow)' : ''}`,
      });
      if (status === 'pass') tests.summary.passed++;
      else if (status === 'warning') tests.summary.warnings++;
      else tests.summary.failed++;
    }
  } catch (error: any) {
    tests.results.push({
      test: 'Database Query Performance',
      status: 'fail',
      message: `Error: ${error.message || 'Unknown error'}`,
    });
    tests.summary.failed++;
  }

  const overallStatus = tests.summary.failed > 0 ? 'fail' : tests.summary.warnings > 0 ? 'warning' : 'pass';
  const statusCode = overallStatus === 'pass' ? 200 : overallStatus === 'warning' ? 200 : 503;

  return NextResponse.json({
    status: overallStatus,
    ...tests,
  }, { status: statusCode });
}

