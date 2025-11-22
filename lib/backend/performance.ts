/**
 * Backend Performance Utilities
 * Performance monitoring and optimization helpers
 */

import { logger } from './logger';

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  /**
   * Measure async operation performance
   */
  async measure<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.recordMetric(operation, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.recordMetric(`${operation}:error`, duration);
      throw error;
    }
  }

  /**
   * Record performance metric
   */
  private recordMetric(operation: string, duration: number): void {
    this.metrics.push({
      operation,
      duration,
      timestamp: Date.now()
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (duration > 1000) {
      logger.warn('Slow operation detected', { operation, duration });
    }
  }

  /**
   * Get performance stats
   */
  getStats(operation?: string): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
  } {
    const filtered = operation
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;

    if (filtered.length === 0) {
      return { count: 0, avgDuration: 0, minDuration: 0, maxDuration: 0 };
    }

    const durations = filtered.map(m => m.duration);
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    return {
      count: filtered.length,
      avgDuration: Math.round(avg),
      minDuration: min,
      maxDuration: max
    };
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Batch database operations for better performance
 */
export async function batchOperation<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(item => operation(item))
    );
    
    results.push(
      ...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : null
      ).filter(Boolean) as R[]
    );
  }
  
  return results;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

