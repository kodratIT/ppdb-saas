import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTenant, listTenants } from '../../src/lib/server/domain/admin';
import { db } from '../../src/lib/server/db';
import { tenants, auditLogs } from '../../src/lib/server/db/schema';

// Mock db
vi.mock('../../src/lib/server/db', () => ({
	db: {
		insert: vi.fn(() => ({
			values: vi.fn(() => ({
				returning: vi.fn()
			}))
		})),
		select: vi.fn(() => ({
			from: vi.fn()
		}))
	}
}));

describe('Admin Service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createTenant', () => {
		it('should throw error for reserved slug', async () => {
			const reservedSlug = 'admin';
			await expect(
				createTenant({ name: 'Admin School', slug: reservedSlug }, 'actor')
			).rejects.toThrow('Reserved slug');
		});

		it('should insert a new tenant and create audit log', async () => {
			const name = 'New School';
			const slug = 'new-school';
			const actorId = 'admin-user-id';
			const mockTenant = { id: '123', name, slug, status: 'active' };

			// Setup mock chain for tenant insert
			const returningTenantMock = vi.fn().mockResolvedValue([mockTenant]);
			const valuesTenantMock = vi.fn(() => ({ returning: returningTenantMock }));

			// Setup mock chain for audit log insert (fire and forget usually, but we await it for consistency)
			const returningLogMock = vi.fn().mockResolvedValue([]);
			const valuesLogMock = vi.fn(() => ({ returning: returningLogMock }));

			const insertMock = vi
				.fn()
				.mockReturnValueOnce({ values: valuesTenantMock }) // First call: tenants
				.mockReturnValueOnce({ values: valuesLogMock }); // Second call: auditLogs

			(db.insert as any).mockImplementation(insertMock);

			const result = await createTenant({ name, slug }, actorId);

			expect(insertMock).toHaveBeenNthCalledWith(1, tenants);
			expect(valuesTenantMock).toHaveBeenCalledWith(
				expect.objectContaining({
					name,
					slug,
					status: 'active'
				})
			);

			expect(insertMock).toHaveBeenNthCalledWith(2, auditLogs);
			expect(valuesLogMock).toHaveBeenCalledWith(
				expect.objectContaining({
					actorId,
					action: 'create_tenant',
					target: `tenant:${slug}`
				})
			);

			expect(result).toEqual(mockTenant);
		});
	});

	describe('listTenants', () => {
		it('should return all tenants', async () => {
			const mockTenants = [
				{ id: '1', name: 'School 1', slug: 's1', status: 'active' },
				{ id: '2', name: 'School 2', slug: 's2', status: 'active' }
			];

			const fromMock = vi.fn().mockResolvedValue(mockTenants);
			const selectMock = vi.fn(() => ({ from: fromMock }));

			(db.select as any).mockImplementation(selectMock);

			const result = await listTenants();

			expect(db.select).toHaveBeenCalled();
			expect(fromMock).toHaveBeenCalledWith(tenants);
			expect(result).toEqual(mockTenants);
		});
	});
});
