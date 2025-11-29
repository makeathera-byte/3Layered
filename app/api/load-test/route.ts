import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { logger } from '@/lib/backend/logger';
import { getRazorpayInstance } from '@/lib/razorpay/config';
import { rateLimit } from '@/lib/backend/security';
import { cache } from '@/lib/backend/cache';
import { performanceMonitor } from '@/lib/backend/performance';

export async function GET(request: NextRequest) {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as Array<{ test: string; status: 'pass' | 'fail' | 'warning'; message: string; metrics?: any }>,
    summary: { total: 0, passed: 0, failed: 0, warnings: 0 },
  };

  // Test 1: Database Connection Pool
  testResults.summary.total++;
  try {
    const startTime = Date.now();
    const connections = await Promise.all([
      supabaseAdmin.from('users').select('count').limit(1),
      supabaseAdmin.from('orders').select('count').limit(1),
      supabaseAdmin.from('products').select('count').limit(1),
    ]);
    const duration = Date.now() - startTime;

    const allSuccess = connections.every(conn => !conn.error);
    if (allSuccess && duration < 2000) {
      testResults.tests.push({
        test: 'Database Connection Pool',
        status: 'pass',
        message: `All connections successful in ${duration}ms`,
        metrics: { duration, connections: connections.length },
      });
      testResults.summary.passed++;
    } else if (allSuccess) {
      testResults.tests.push({
        test: 'Database Connection Pool',
        status: 'warning',
        message: `Connections successful but slow: ${duration}ms`,
        metrics: { duration },
      });
      testResults.summary.warnings++;
    } else {
      throw new Error('Some connections failed');
    }
  } catch (error: any) {
    testResults.tests.push({
      test: 'Database Connection Pool',
      status: 'fail',
      message: `Failed: ${error.message || 'Unknown error'}`,
    });
    testResults.summary.failed++;
  }

  // Test 2: Rate Limiting
  testResults.summary.total++;
  try {
    const testKey = `test:${Date.now()}`;
    const results = [];
    for (let i = 0; i < 15; i++) {
      results.push(rateLimit(testKey, 10, 60000));
    }
    const allowed = results.filter(r => r).length;
    const blocked = results.filter(r => !r).length;

    if (allowed === 10 && blocked === 5) {
      testResults.tests.push({
        test: 'Rate Limiting',
        status: 'pass',
        message: 'Rate limiting working correctly',
        metrics: { allowed, blocked },
      });
      testResults.summary.passed++;
    } else {
      testResults.tests.push({
        test: 'Rate Limiting',
        status: 'warning',
        message: `Rate limiting may need adjustment: ${allowed} allowed, ${blocked} blocked`,
        metrics: { allowed, blocked },
      });
      testResults.summary.warnings++;
    }
  } catch (error: any) {
    testResults.tests.push({
      test: 'Rate Limiting',
      status: 'fail',
      message: `Failed: ${error.message || 'Unknown error'}`,
    });
    testResults.summary.failed++;
  }

  // Test 3: Cache Performance
  testResults.summary.total++;
  try {
    const cacheKey = `test:cache:${Date.now()}`;
    const testData = { test: 'data', timestamp: Date.now() };
    
    cache.set(cacheKey, testData, 10000);
    const retrieved = cache.get(cacheKey);
    
    if (retrieved && JSON.stringify(retrieved) === JSON.stringify(testData)) {
      testResults.tests.push({
        test: 'Cache Performance',
        status: 'pass',
        message: 'Cache working correctly',
        metrics: cache.getStats(),
      });
      testResults.summary.passed++;
    } else {
      throw new Error('Cache retrieval failed');
    }
  } catch (error: any) {
    testResults.tests.push({
      test: 'Cache Performance',
      status: 'fail',
      message: `Failed: ${error.message || 'Unknown error'}`,
    });
    testResults.summary.failed++;
  }

  // Test 4: Razorpay Connection
  testResults.summary.total++;
  try {
    const razorpay = getRazorpayInstance();
    // Just verify instance creation, don't make actual API call
    if (razorpay) {
      testResults.tests.push({
        test: 'Razorpay Connection',
        status: 'pass',
        message: 'Razorpay instance created successfully',
      });
      testResults.summary.passed++;
    } else {
      throw new Error('Razorpay instance creation failed');
    }
  } catch (error: any) {
    testResults.tests.push({
      test: 'Razorpay Connection',
      status: 'fail',
      message: `Failed: ${error.message || 'Unknown error'}`,
    });
    testResults.summary.failed++;
  }

  // Test 5: Concurrent Request Handling
  testResults.summary.total++;
  try {
    const startTime = Date.now();
    const concurrentRequests = Array(10).fill(null).map(() =>
      supabaseAdmin.from('users').select('count').limit(1)
    );
    const results = await Promise.allSettled(concurrentRequests);
    const duration = Date.now() - startTime;
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    if (successful >= 8 && duration < 3000) {
      testResults.tests.push({
        test: 'Concurrent Request Handling',
        status: 'pass',
        message: `${successful}/10 requests successful in ${duration}ms`,
        metrics: { successful, failed, duration },
      });
      testResults.summary.passed++;
    } else if (successful >= 5) {
      testResults.tests.push({
        test: 'Concurrent Request Handling',
        status: 'warning',
        message: `${successful}/10 requests successful (may need optimization)`,
        metrics: { successful, failed, duration },
      });
      testResults.summary.warnings++;
    } else {
      throw new Error(`Only ${successful}/10 requests successful`);
    }
  } catch (error: any) {
    testResults.tests.push({
      test: 'Concurrent Request Handling',
      status: 'fail',
      message: `Failed: ${error.message || 'Unknown error'}`,
    });
    testResults.summary.failed++;
  }

  // Test 6: Error Handling
  testResults.summary.total++;
  try {
    // Test that errors are properly caught
    const { error } = await supabaseAdmin
      .from('nonexistent_table')
      .select('*')
      .limit(1);
    
    if (error) {
      testResults.tests.push({
        test: 'Error Handling',
        status: 'pass',
        message: 'Errors are properly caught and returned',
      });
      testResults.summary.passed++;
    } else {
      throw new Error('Error handling not working');
    }
  } catch (error: any) {
    testResults.tests.push({
      test: 'Error Handling',
      status: 'fail',
      message: `Failed: ${error.message || 'Unknown error'}`,
    });
    testResults.summary.failed++;
  }

  const overallStatus = testResults.summary.failed > 0 ? 'fail' : testResults.summary.warnings > 0 ? 'warning' : 'pass';
  const statusCode = overallStatus === 'pass' ? 200 : overallStatus === 'warning' ? 200 : 503;

  return NextResponse.json({
    status: overallStatus,
    ...testResults,
  }, { status: statusCode });
}

