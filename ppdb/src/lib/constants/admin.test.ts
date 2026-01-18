import { describe, it, expect } from 'vitest';
import {
	PAGINATION_LIMIT,
	POLLING_INTERVAL,
	SEARCH_DEBOUNCE,
	TOAST_DURATION,
	CACHE_TTL,
	MAX_BULK_OPERATIONS,
	TENANT_ID_DISPLAY_LENGTH
} from './admin';

describe('Admin Constants', () => {
	describe('PAGINATION_LIMIT', () => {
		it('should be defined as a number', () => {
			expect(PAGINATION_LIMIT).toBeDefined();
			expect(typeof PAGINATION_LIMIT).toBe('number');
		});

		it('should be a positive integer', () => {
			expect(PAGINATION_LIMIT).toBeGreaterThan(0);
			expect(Number.isInteger(PAGINATION_LIMIT)).toBe(true);
		});

		it('should have the expected value', () => {
			expect(PAGINATION_LIMIT).toBe(20);
		});
	});

	describe('POLLING_INTERVAL', () => {
		it('should be defined as a number', () => {
			expect(POLLING_INTERVAL).toBeDefined();
			expect(typeof POLLING_INTERVAL).toBe('number');
		});

		it('should be a positive integer', () => {
			expect(POLLING_INTERVAL).toBeGreaterThan(0);
			expect(Number.isInteger(POLLING_INTERVAL)).toBe(true);
		});

		it('should be 60 seconds in milliseconds', () => {
			expect(POLLING_INTERVAL).toBe(60000);
			expect(POLLING_INTERVAL).toBe(60 * 1000);
		});
	});

	describe('SEARCH_DEBOUNCE', () => {
		it('should be defined as a number', () => {
			expect(SEARCH_DEBOUNCE).toBeDefined();
			expect(typeof SEARCH_DEBOUNCE).toBe('number');
		});

		it('should be a positive integer', () => {
			expect(SEARCH_DEBOUNCE).toBeGreaterThan(0);
			expect(Number.isInteger(SEARCH_DEBOUNCE)).toBe(true);
		});

		it('should be 300 milliseconds', () => {
			expect(SEARCH_DEBOUNCE).toBe(300);
		});
	});

	describe('TOAST_DURATION', () => {
		it('should be defined as a number', () => {
			expect(TOAST_DURATION).toBeDefined();
			expect(typeof TOAST_DURATION).toBe('number');
		});

		it('should be a positive integer', () => {
			expect(TOAST_DURATION).toBeGreaterThan(0);
			expect(Number.isInteger(TOAST_DURATION)).toBe(true);
		});

		it('should be 5 seconds in milliseconds', () => {
			expect(TOAST_DURATION).toBe(5000);
			expect(TOAST_DURATION).toBe(5 * 1000);
		});
	});

	describe('CACHE_TTL', () => {
		it('should be defined as a number', () => {
			expect(CACHE_TTL).toBeDefined();
			expect(typeof CACHE_TTL).toBe('number');
		});

		it('should be a positive integer', () => {
			expect(CACHE_TTL).toBeGreaterThan(0);
			expect(Number.isInteger(CACHE_TTL)).toBe(true);
		});

		it('should be 5 minutes in seconds', () => {
			expect(CACHE_TTL).toBe(300);
			expect(CACHE_TTL).toBe(5 * 60);
		});
	});

	describe('MAX_BULK_OPERATIONS', () => {
		it('should be defined as a number', () => {
			expect(MAX_BULK_OPERATIONS).toBeDefined();
			expect(typeof MAX_BULK_OPERATIONS).toBe('number');
		});

		it('should be a positive integer', () => {
			expect(MAX_BULK_OPERATIONS).toBeGreaterThan(0);
			expect(Number.isInteger(MAX_BULK_OPERATIONS)).toBe(true);
		});

		it('should have a reasonable limit', () => {
			expect(MAX_BULK_OPERATIONS).toBe(50);
			expect(MAX_BULK_OPERATIONS).toBeLessThanOrEqual(100);
		});
	});

	describe('TENANT_ID_DISPLAY_LENGTH', () => {
		it('should be defined as a number', () => {
			expect(TENANT_ID_DISPLAY_LENGTH).toBeDefined();
			expect(typeof TENANT_ID_DISPLAY_LENGTH).toBe('number');
		});

		it('should be a positive integer', () => {
			expect(TENANT_ID_DISPLAY_LENGTH).toBeGreaterThan(0);
			expect(Number.isInteger(TENANT_ID_DISPLAY_LENGTH)).toBe(true);
		});

		it('should be 8 characters', () => {
			expect(TENANT_ID_DISPLAY_LENGTH).toBe(8);
		});

		it('should be suitable for UUID prefix display', () => {
			// UUIDs are 36 characters, 8 is a reasonable prefix
			expect(TENANT_ID_DISPLAY_LENGTH).toBeLessThan(36);
			expect(TENANT_ID_DISPLAY_LENGTH).toBeGreaterThanOrEqual(6);
		});
	});

	describe('Constants Relationships', () => {
		it('should have POLLING_INTERVAL much greater than SEARCH_DEBOUNCE', () => {
			expect(POLLING_INTERVAL).toBeGreaterThan(SEARCH_DEBOUNCE * 10);
		});

		it('should have TOAST_DURATION greater than SEARCH_DEBOUNCE', () => {
			expect(TOAST_DURATION).toBeGreaterThan(SEARCH_DEBOUNCE);
		});

		it('should have CACHE_TTL in seconds while POLLING_INTERVAL in milliseconds', () => {
			// CACHE_TTL is 300 seconds (5 minutes)
			// POLLING_INTERVAL is 60000 milliseconds (60 seconds)
			// Converting CACHE_TTL to milliseconds should be greater than POLLING_INTERVAL
			expect(CACHE_TTL * 1000).toBeGreaterThan(POLLING_INTERVAL);
		});
	});
});
