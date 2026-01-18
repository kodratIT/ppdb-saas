/**
 * Admin-related constants for the Super Admin dashboard
 */

/**
 * Number of items to display per page in paginated lists
 */
export const PAGINATION_LIMIT = 20;

/**
 * Interval in milliseconds for polling data updates (60 seconds)
 */
export const POLLING_INTERVAL = 60000;

/**
 * Debounce delay in milliseconds for search input (300ms)
 */
export const SEARCH_DEBOUNCE = 300;

/**
 * Duration in milliseconds for toast notifications (5 seconds)
 */
export const TOAST_DURATION = 5000;

/**
 * Cache TTL in seconds for statistics (5 minutes)
 */
export const CACHE_TTL = 300;

/**
 * Maximum number of items that can be processed in a single bulk operation
 */
export const MAX_BULK_OPERATIONS = 50;

/**
 * Number of characters to display from tenant ID (e.g., "abc123..." from full UUID)
 */
export const TENANT_ID_DISPLAY_LENGTH = 8;
