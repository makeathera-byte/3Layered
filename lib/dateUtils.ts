/**
 * Date formatting utilities that prevent hydration mismatches
 * by ensuring consistent formatting between server and client
 */

/**
 * Format date consistently for both server and client
 * Uses UTC to avoid timezone differences
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Use UTC to ensure consistency between server and client
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format date and time consistently
 */
export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Use UTC to ensure consistency
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Format date in a user-friendly way (only use on client-side after mount)
 */
export function formatDateLocale(dateString: string | Date, locale: string = 'en-US'): string {
  if (typeof window === 'undefined') {
    // Server-side: return a safe format
    return formatDate(dateString);
  }
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time in a user-friendly way (only use on client-side after mount)
 */
export function formatDateTimeLocale(dateString: string | Date, locale: string = 'en-US'): string {
  if (typeof window === 'undefined') {
    // Server-side: return a safe format
    return formatDateTime(dateString);
  }
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time only (only use on client-side after mount)
 */
export function formatTimeLocale(dateString: string | Date, locale: string = 'en-US'): string {
  if (typeof window === 'undefined') {
    // Server-side: return a safe format
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

