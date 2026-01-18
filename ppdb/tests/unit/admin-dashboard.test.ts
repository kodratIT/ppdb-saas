/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardStats } from '../../src/lib/server/domain/admin';
import { db } from '../../src/lib/server/db';

// Mock db
vi.mock('../../src/lib/server/db', () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					groupBy: vi.fn(() => ({
						orderBy: vi.fn(() => ({
							limit: vi.fn()
						}))
					}))
				}))
			})),
			leftJoin: vi.fn(() => ({
				groupBy: vi.fn(() => ({
					orderBy: vi.fn(() => ({
						limit: vi.fn()
					}))
				}))
			}))
		}))
	}
}));

describe('Admin Dashboard Stats', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return all required dashboard stats with correct types', async () => {
		// Mock responses for each query in getDashboardStats
		const mockTenants = [
			{ id: '1', status: 'active', createdAt: new Date() },
			{ id: '2', status: 'active', createdAt: new Date() }
		];
		const mockUsersCount = [{ count: 10 }];
		const mockNewUsersToday = [{ count: 2 }];
		const mockPendingVerifications = [{ count: 5 }];
		const mockTotalApplications = [{ count: 50 }];
		const mockPaidInvoicesCount = [{ count: 20 }];
		const mockRevenue = [{ total: 1000000 }];
		const mockDailyRevenue = [{ date: '2023-01-01', amount: 100000 }];
		const mockTopSchools = [
			{ id: '1', name: 'School 1', slug: 's1', appCount: 10, revenue: 500000 }
		];

		// Mock implementation for sequential db.select() calls
		const selectMock = db.select as any;
		selectMock
			.mockReturnValueOnce({ from: vi.fn().mockResolvedValue(mockTenants) }) // 1. Total Tenants
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockUsersCount)
			}) // 2. Total Users
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockNewUsersToday)
			}) // 3. New Registrations Today
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockPendingVerifications)
			}) // 4. Pending Verifications
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockTotalApplications)
			}) // 5. Total Applications
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockPaidInvoicesCount)
			}) // 6. Paid Invoices
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockRevenue)
			}) // 7. Total Revenue
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				groupBy: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mockDailyRevenue)
			}) // 8. Revenue Trend
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				groupBy: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockReturnThis(),
				limit: vi.fn().mockResolvedValue(mockTopSchools)
			}); // 9. Top Performing Schools

		const stats = await getDashboardStats();

		// Basic checks
		expect(stats).toBeDefined();

		// New Property Checks
		expect(stats.users).toHaveProperty('newRegistrationsToday', 2);
		expect(stats.applications).toHaveProperty('pendingVerifications', 5);
		expect(stats.financial).toHaveProperty('averageRevenuePerSchool', 500000); // 1,000,000 / 2 active tenants
		expect(stats.financial).toHaveProperty('conversionRate', 40); // (20 paid / 50 total) * 100
	});

	it('should handle zero active schools for average revenue', async () => {
		const mockTenants: any[] = [];
		const mockUsersCount = [{ count: 0 }];
		const mockNewUsersToday = [{ count: 0 }];
		const mockPendingVerifications = [{ count: 0 }];
		const mockTotalApplications = [{ count: 0 }];
		const mockPaidInvoicesCount = [{ count: 0 }];
		const mockRevenue = [{ total: 0 }];
		const mockDailyRevenue: any[] = [];
		const mockTopSchools: any[] = [];

		(db.select as any)
			.mockReturnValueOnce({ from: vi.fn().mockResolvedValue(mockTenants) })
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockUsersCount)
			})
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockNewUsersToday)
			})
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockPendingVerifications)
			})
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockTotalApplications)
			})
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockPaidInvoicesCount)
			})
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockResolvedValue(mockRevenue)
			})
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				groupBy: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockResolvedValue(mockDailyRevenue)
			})
			.mockReturnValueOnce({
				from: vi.fn().mockReturnThis(),
				leftJoin: vi.fn().mockReturnThis(),
				groupBy: vi.fn().mockReturnThis(),
				orderBy: vi.fn().mockReturnThis(),
				limit: vi.fn().mockResolvedValue(mockTopSchools)
			});

		const stats = await getDashboardStats();
		expect(stats.financial.averageRevenuePerSchool).toBe(0);
	});
});
