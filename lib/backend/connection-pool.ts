/**
 * Backend Connection Pool Management
 * Optimized Supabase client management for high traffic
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Connection pool configuration
const MAX_CONNECTIONS = 10;
const CONNECTION_TIMEOUT = 30000; // 30 seconds

class ConnectionPool {
  private clients: SupabaseClient[] = [];
  private inUse = new Set<number>();
  private queue: Array<{
    resolve: (client: SupabaseClient) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor() {
    // Pre-create connections
    for (let i = 0; i < MAX_CONNECTIONS; i++) {
      this.clients.push(this.createClient());
    }
  }

  private createClient(): SupabaseClient {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        db: {
          schema: 'public',
        },
        global: {
          headers: {
            'x-client-info': '3layered-backend',
          },
        },
      }
    );
  }

  /**
   * Get a client from the pool
   */
  async acquire(): Promise<SupabaseClient> {
    // Find available client
    for (let i = 0; i < this.clients.length; i++) {
      if (!this.inUse.has(i)) {
        this.inUse.add(i);
        return this.clients[i];
      }
    }

    // All clients in use, wait in queue
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection pool timeout'));
      }, CONNECTION_TIMEOUT);

      this.queue.push({
        resolve: (client) => {
          clearTimeout(timeout);
          resolve(client);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });
    });
  }

  /**
   * Release a client back to the pool
   */
  release(client: SupabaseClient): void {
    const index = this.clients.indexOf(client);
    if (index !== -1) {
      this.inUse.delete(index);
      
      // Process queue if there are waiting requests
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) {
          this.inUse.add(index);
          next.resolve(client);
        }
      }
    }
  }

  /**
   * Execute operation with connection from pool
   */
  async withConnection<T>(
    operation: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    const client = await this.acquire();
    try {
      return await operation(client);
    } finally {
      this.release(client);
    }
  }

  /**
   * Get pool stats
   */
  getStats() {
    return {
      total: this.clients.length,
      inUse: this.inUse.size,
      available: this.clients.length - this.inUse.size,
      queueLength: this.queue.length,
    };
  }
}

// For now, use single client (Supabase handles connection pooling)
// In production with multiple instances, use the pool above
export const connectionPool = {
  async withConnection<T>(
    operation: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    // Supabase client is already optimized, just use it directly
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    return operation(supabaseAdmin);
  },
};

