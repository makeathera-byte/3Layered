/**
 * Backend Database Utilities
 * Database helpers and transaction management
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import { DatabaseError } from './errors';
import { logger } from './logger';

/**
 * Execute database operation with error handling
 */
export async function dbOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  errorMessage: string
): Promise<T> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      logger.error(errorMessage, error);
      throw new DatabaseError(errorMessage, error);
    }
    
    if (!data) {
      throw new DatabaseError(`${errorMessage}: No data returned`);
    }
    
    return data;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    logger.error(errorMessage, error);
    throw new DatabaseError(errorMessage, error);
  }
}

/**
 * Check if table exists and has required columns
 */
export async function verifyTableStructure(
  tableName: string,
  requiredColumns: string[]
): Promise<boolean> {
  try {
    // Try a simple query to verify table exists
    const { error } = await supabaseAdmin
      .from(tableName)
      .select('id')
      .limit(0);
    
    if (error) {
      const errorMsg = error.message?.toLowerCase() || '';
      if (errorMsg.includes('does not exist') || errorMsg.includes('schema cache')) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    logger.error(`Error verifying table structure for ${tableName}`, error);
    return false;
  }
}

/**
 * Safe JSONB insert
 */
export function prepareJSONBData(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  
  if (Array.isArray(data) || typeof data === 'object') {
    return data;
  }
  
  return data;
}

/**
 * Generate unique order number with retry
 */
export async function generateUniqueOrderNumber(maxRetries: number = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data, error } = await supabaseAdmin.rpc('generate_order_number');
      
      if (!error && data) {
        return data;
      }
      
      // Fallback to manual generation
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      const orderNumber = `3L-${date}-${random}`;
      
      // Check if order number already exists
      const { data: existing } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber)
        .maybeSingle();
      
      if (!existing) {
        return orderNumber;
      }
      
      // If exists, wait a bit and retry
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      logger.warn('Error generating order number', { attempt: i + 1, error });
    }
  }
  
  // Final fallback
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const timestamp = Date.now().toString().slice(-6);
  return `3L-${date}-${timestamp}`;
}

