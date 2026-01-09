import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveTenant } from '$lib/server/tenant';

// Mock DB
vi.mock('$lib/server/db', () => ({
	db: {
		query: {
			tenants: {
				findFirst: vi.fn()
			}
		}
	}
}));

import { db } from '$lib/server/db';

describe('Tenant Resolution', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should return null if no subdomain', async () => {
		const result = await resolveTenant('', undefined);
		expect(result).toBeNull();
	});

	it('should return cached tenant from KV', async () => {
		const mockKV = {
			get: vi
				.fn()
				.mockResolvedValue({ id: '123', slug: 'school', name: 'School', status: 'active' }),
			put: vi.fn()
		};
		const platform = { env: { TENANTS_KV: mockKV } } as any;

		const result = await resolveTenant('school', platform);
		expect(mockKV.get).toHaveBeenCalledWith('subdomain:school', 'json');
		expect(result).toEqual({ id: '123', slug: 'school', name: 'School', status: 'active' });
		expect(db.query.tenants.findFirst).not.toHaveBeenCalled();
	});

	it('should fallback to DB if KV miss, and cache it', async () => {
		const mockKV = {
			get: vi.fn().mockResolvedValue(null),
			put: vi.fn()
		};
		const platform = { env: { TENANTS_KV: mockKV } } as any;

		// Mock DB response
		vi.mocked(db.query.tenants.findFirst).mockResolvedValue({
			id: 'db-id',
			name: 'School',
			slug: 'school',
			status: 'active',
			createdAt: new Date(),
			updatedAt: new Date()
		} as any);

		const result = await resolveTenant('school', platform);

		expect(mockKV.get).toHaveBeenCalled();
		expect(db.query.tenants.findFirst).toHaveBeenCalled();
		expect(mockKV.put).toHaveBeenCalledWith(
			'subdomain:school',
			expect.stringContaining('"id":"db-id"'),
			expect.objectContaining({ expirationTtl: 3600 })
		);
		expect(result?.id).toBe('db-id');
	});

	it('should return null if not in DB', async () => {
		const mockKV = {
			get: vi.fn().mockResolvedValue(null),
			put: vi.fn()
		};
		const platform = { env: { TENANTS_KV: mockKV } } as any;

		vi.mocked(db.query.tenants.findFirst).mockResolvedValue(null);

		const result = await resolveTenant('unknown', platform);
		expect(result).toBeNull();
	});
});
