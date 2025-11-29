// Admin API Helper Functions
import { getAdminSession } from './adminAuth';

const getAuthHeaders = () => {
  const session = getAdminSession();
  if (!session) throw new Error('No admin session');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JSON.stringify(session)}`
  };
};

// Products API
export const adminProductsAPI = {
  getAll: async () => {
    const response = await fetch('/api/products/list', {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  create: async (product: any) => {
    const response = await fetch('/api/products/add', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create product');
    }
    return response.json();
  },

  update: async (id: string, product: any) => {
    const response = await fetch('/api/products/update', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...product })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update product');
    }
    return response.json();
  },

  delete: async (id: string, permanent = false) => {
    const url = `/api/products/delete?id=${id}${permanent ? '&permanent=true' : ''}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }
    return response.json();
  }
};

// Orders API
export const adminOrdersAPI = {
  getAll: async (cacheBuster = '') => {
    const url = `/api/admin/orders${cacheBuster}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
      cache: 'no-store' // Prevent browser caching
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  updateStatus: async (id: string, updates: any) => {
    const response = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...updates })
    });
    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
  },

  delete: async (id: string) => {
    try {
      const url = `/api/admin/orders?id=${id}`;
      console.log('[Admin API] Deleting order:', { id, url });
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      console.log('[Admin API] Delete response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.error('[Admin API] Failed to parse error response:', parseError);
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('[Admin API] Delete error response:', errorData);
        
        // Include details if available
        const errorMessage = errorData.error || errorData.message || `Failed to delete order (HTTP ${response.status})`;
        const error = new Error(errorMessage);
        // Attach additional error info
        (error as any).details = errorData.details || errorData;
        (error as any).code = errorData.code;
        (error as any).status = response.status;
        throw error;
      }
      
      const result = await response.json();
      console.log('[Admin API] Delete successful:', result);
      return result;
    } catch (error: any) {
      console.error('[Admin API] Delete request failed:', error);
      throw error;
    }
  }
};

// Users API
export const adminUsersAPI = {
  getAll: async () => {
    const response = await fetch('/api/admin/users', {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  updateRole: async (id: string, role: string) => {
    const response = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, role })
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  }
};

// Reviews API
export const adminReviewsAPI = {
  getAll: async () => {
    const response = await fetch('/api/admin/reviews', {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  approve: async (id: string, is_approved: boolean) => {
    const response = await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, is_approved })
    });
    if (!response.ok) throw new Error('Failed to approve review');
    return response.json();
  },

  respond: async (id: string, admin_response: string) => {
    const response = await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, admin_response })
    });
    if (!response.ok) throw new Error('Failed to respond to review');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/admin/reviews?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete review');
    return response.json();
  }
};

// Stats API
export const adminStatsAPI = {
  get: async () => {
    const response = await fetch('/api/admin/stats', {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }
};

// Media API
export const adminMediaAPI = {
  getAll: async (type?: string, category?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (category) params.append('category', category);
    const url = `/api/admin/media${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.details || 'Failed to fetch media';
      throw new Error(errorMessage);
    }
    return response.json();
  },

  create: async (media: any) => {
    const response = await fetch('/api/admin/media', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(media)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create media');
    }
    return response.json();
  },

  update: async (id: string, updates: any) => {
    const response = await fetch('/api/admin/media', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, ...updates })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update media');
    }
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/admin/media?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete media');
    }
    return response.json();
  },

  upload: async (file: File, type: string, metadata?: {
    category?: string;
    title?: string;
    description?: string;
    alt_text?: string;
  }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (metadata?.category) formData.append('category', metadata.category);
    if (metadata?.title) formData.append('title', metadata.title);
    if (metadata?.description) formData.append('description', metadata.description);
    if (metadata?.alt_text) formData.append('alt_text', metadata.alt_text);

    const session = getAdminSession();
    if (!session) throw new Error('No admin session');

    const response = await fetch('/api/admin/media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JSON.stringify(session)}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }
    return response.json();
  }
};

// Custom Print Orders API
export const adminCustomPrintAPI = {
  getAll: async (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const url = `/api/admin/custom-print${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.details || 'Failed to fetch custom print orders';
      throw new Error(errorMessage);
    }
    return response.json();
  },

  update: async (id: string, updates: { status?: string; quote_amount?: number; quote_notes?: string; admin_notes?: string }) => {
    const response = await fetch('/api/admin/custom-print', {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update order');
    }
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/admin/custom-print?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete order');
    }
    return response.json();
  },
};

// Customized Orders API
export const adminCustomizedOrdersAPI = {
  getAll: async (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    const url = `/api/admin/customized-orders${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.details || 'Failed to fetch customized orders';
      throw new Error(errorMessage);
    }
    return response.json();
  },

  update: async (id: string, updates: { status?: string; admin_notes?: string; quote_amount?: number }) => {
    const response = await fetch('/api/admin/customized-orders', {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update order');
    }
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/admin/customized-orders?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete order');
    }
    return response.json();
  },
};
