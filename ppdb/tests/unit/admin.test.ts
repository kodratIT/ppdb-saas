/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTenant, listTenants, getDashboardStats } from '../../src/lib/server/domain/admin';
import { db } from '../../src/lib/server/db';
import { tenants, auditLogs, users, applications, invoices } from '../../src/lib/server/db/schema';

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

	describe('getDashboardStats', () => {
		it('should return correct dashboard statistics with new metrics', async () => {
			const mockTenants = [
				{ id: '1', name: 'S1', slug: 's1', status: 'active', createdAt: new Date() },
				{ id: '2', name: 'S2', slug: 's2', status: 'active', createdAt: new Date() }
			];

			const fromMock = vi.fn().mockReturnValue({
				where: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				groupBy: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockReturnThis(),
				limit: vi.fn().mockResolvedValue([])
			});

			const selectMock = vi.fn().mockReturnValue({
				from: fromMock,
				where: vi.fn().mockReturnThis(),
				groupBy: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockReturnThis(),
				limit: vi.fn().mockResolvedValue([])
			});

			(db.select as any).mockImplementation(selectMock);

			// First select: all tenants
			fromMock.mockResolvedValueOnce(mockTenants);
			// Second select: usersCount
			fromMock.mockReturnValueOnce({ where: vi.fn().mockResolvedValue([{ count: 10 }]) });
			// Third select: newUsersToday
			fromMock.mockReturnValueOnce({ where: vi.fn().mockResolvedValue([{ count: 2 }]) });
			// Fourth select: pendingVerifications
			fromMock.mockReturnValueOnce({ where: vi.fn().mockResolvedValue([{ count: 5 }]) });
			// Fifth select: totalApplications
			fromMock.mockResolvedValueOnce([{ count: 20 }]);
			// Sixth select: transactionsCount
			fromMock.mockReturnValueOnce({ where: vi.fn().mockResolvedValue([{ count: 8 }]) });
			// Seventh select: revenueResult
			fromMock.mockReturnValueOnce({ where: vi.fn().mockResolvedValue([{ total: 8000 }]) });

			const stats = await getDashboardStats();

			expect(stats.users).toHaveProperty('newRegistrationsToday');
			expect(typeof stats.users.newRegistrationsToday).toBe('number');

			expect(stats.applications).toHaveProperty('pendingVerifications');
			expect(typeof stats.applications.pendingVerifications).toBe('number');

			expect(stats.financial).toHaveProperty('averageRevenuePerSchool');
			expect(typeof stats.financial.averageRevenuePerSchool).toBe('number');

			expect(stats.financial).toHaveProperty('conversionRate');
			expect(typeof stats.financial.conversionRate).toBe('number');

			expect(stats.users.newRegistrationsToday).toBe(2);
			expect(stats.applications.pendingVerifications).toBe(5);
			expect(stats.financial.averageRevenuePerSchool).toBe(4000); // 8000 / 2
			expect(stats.financial.conversionRate).toBe(40); // (8 / 20) * 100
		});
	});
});
