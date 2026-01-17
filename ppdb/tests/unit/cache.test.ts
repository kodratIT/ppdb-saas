import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCached, setCached, clearCache } from '../../src/lib/server/cache';

describe('Memory Cache Utility', () => {
	beforeEach(() => {
		clearCache();
		vi.useFakeTimers();
	});

	it('should set and get cache', () => {
		setCached('test', { foo: 'bar' });
		expect(getCached('test')).toEqual({ foo: 'bar' });
	});

	it('should return null for non-existent key', () => {
		expect(getCached('non-existent')).toBeNull();
	});

	it('should expire cache after TTL', () => {
		setCached('test', { foo: 'bar' }, 1); // 1 second TTL

		vi.advanceTimersByTime(500);
		expect(getCached('test')).toEqual({ foo: 'bar' });

		vi.advanceTimersByTime(600);
		expect(getCached('test')).toBeNull();
	});

	it('should clear cache by pattern', () => {
		setCached('tenants:1', 'data1');
		setCached('tenants:2', 'data2');
		setCached('users:1', 'user1');

		clearCache('tenants:');

		expect(getCached('tenants:1')).toBeNull();
		expect(getCached('tenants:2')).toBeNull();
		expect(getCached('users:1')).toEqual('user1');
	});

	it('should clear all cache when no pattern provided', () => {
		setCached('tenants:1', 'data1');
		setCached('users:1', 'user1');

		clearCache();

		expect(getCached('tenants:1')).toBeNull();
		expect(getCached('users:1')).toBeNull();
	});
});
