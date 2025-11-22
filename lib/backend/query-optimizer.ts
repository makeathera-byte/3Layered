/**
 * Backend Query Optimization Utilities
 * Optimized database queries for high traffic
 */

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Optimized order fetch with pagination
 */
export async function fetchOrdersOptimized(
  client: SupabaseClient,
  options: {
    limit?: number;
    offset?: number;
    status?: string;
    excludeCustomized?: boolean;
  } = {}
) {
  const { limit = 100, offset = 0, status, excludeCustomized = true } = options;

  let query = client
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  // If excluding customized orders, filter them out
  if (excludeCustomized && data) {
    // Get customized order IDs in a single query
    const { data: customizedOrderIds } = await client
      .from('customized_orders')
      .select('order_id')
      .not('order_id', 'is', null)
      .in('order_id', data.map(o => o.id));

    const customizedIdSet = new Set(
      (customizedOrderIds || []).map((co: any) => co.order_id)
    );

    return {
      data: data.filter(order => !customizedIdSet.has(order.id)),
      count: (count || 0) - customizedIdSet.size,
    };
  }

  return { data: data || [], count: count || 0 };
}

/**
 * Batch insert with error handling
 */
export async function batchInsert<T>(
  client: SupabaseClient,
  table: string,
  items: T[],
  batchSize: number = 50
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    try {
      const { error } = await client
        .from(table)
        .insert(batch);
      
      if (error) {
        failed += batch.length;
        console.error(`Batch insert error (${i}-${i + batch.length}):`, error);
      } else {
        success += batch.length;
      }
    } catch (error) {
      failed += batch.length;
      console.error(`Batch insert exception (${i}-${i + batch.length}):`, error);
    }
  }

  return { success, failed };
}

/**
 * Optimized count query
 */
export async function getCountOptimized(
  client: SupabaseClient,
  table: string,
  filters?: Record<string, any>
): Promise<number> {
  let query = client.from(table).select('*', { count: 'exact', head: true });

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count || 0;
}

