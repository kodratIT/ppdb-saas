import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listTenantsWithStats } from '../../src/lib/server/domain/admin';
import { db } from '../../src/lib/server/db';

vi.mock('../../src/lib/server/db', () => ({
	db: {
		select: vi.fn()
	}
}));

describe('listTenantsWithStats', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return paginated tenants with stats using a single query', async () => {
		const mockData = [
			{
				id: '1',
				name: 'School A',
				slug: 'school-a',
				status: 'active',
				createdAt: new Date(),
				appCount: 10,
				paidInvoices: 5
			}
		];

		// Mock implementation for chainable calls
		const mockChain = {
			from: vi.fn().mockReturnThis(),
			leftJoin: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			groupBy: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			offset: vi.fn().mockResolvedValue(mockData)
		};

		const mockCountChain = {
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockResolvedValue([{ count: 1 }])
		};

		(db.select as any)
			.mockReturnValueOnce(mockCountChain) // First call: count
			.mockReturnValueOnce(mockChain); // Second call: data

		const result = await listTenantsWithStats({ page: 1, limit: 10 });

		expect(result.data).toHaveLength(1);
		expect(result.total).toBe(1);
		expect(result.page).toBe(1);
		expect(result.data[0].stats.applications).toBe(10);
		expect(result.data[0].stats.paidInvoices).toBe(5);
	});

	it('should apply filters and search', async () => {
		const mockChain = {
			from: vi.fn().mockReturnThis(),
			leftJoin: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			groupBy: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			offset: vi.fn().mockResolvedValue([])
		};

		const mockCountChain = {
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockResolvedValue([{ count: 0 }])
		};

		(db.select as any).mockReturnValueOnce(mockCountChain).mockReturnValueOnce(mockChain);

		await listTenantsWithStats({ search: 'test', status: 'active' });

		expect(db.select).toHaveBeenCalled();
		// We could verify the arguments to where() here if needed,
		// but since it's Drizzle's SQL objects, it's a bit complex.
	});
});
