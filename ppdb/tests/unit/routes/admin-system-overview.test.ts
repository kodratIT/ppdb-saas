import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../../../src/lib/server/db';
import * as overviewModule from '../../../src/routes/admin/system/overview/+page.server';

// Mock db
vi.mock('../../../src/lib/server/db', () => ({
	db: {
		execute: vi.fn(),
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					groupBy: vi.fn()
				}))
			}))
		}))
	}
}));

// Mock integrations
vi.mock('../../../src/lib/server/integrations/waha', () => ({
	checkWahaHealth: vi.fn()
}));

vi.mock('../../../src/lib/server/integrations/xendit', () => ({
	checkXenditHealth: vi.fn()
}));

// Mock auth
vi.mock('../../../src/lib/server/auth/authorization', () => ({
	requireAuth: vi.fn(() => Promise.resolve({ role: 'SUPER_ADMIN' })),
	requireSuperAdmin: vi.fn()
}));

describe('System Overview Page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock process.uptime and process.memoryUsage
		global.process = {
			...global.process,
			uptime: vi.fn(() => 3600),
			memoryUsage: vi.fn(() => ({
				heapUsed: 100 * 1024 * 1024,
				heapTotal: 200 * 1024 * 1024,
				rss: 150 * 1024 * 1024,
				external: 0
			}))
		} as any;
	});

	describe('Data Usage Efficiency', () => {
		it('should only fetch data that is used in frontend', async () => {
			const mockExecute = db.execute as any;
			mockExecute.mockResolvedValueOnce([]);

			const { checkWahaHealth } = await import('../../../src/lib/server/integrations/waha');
			const { checkXenditHealth } = await import('../../../src/lib/server/integrations/xendit');

			vi.mocked(checkWahaHealth).mockResolvedValue({
				status: 'healthy',
				latency: 50,
				message: 'OK'
			});

			vi.mocked(checkXenditHealth).mockResolvedValue({
				status: 'healthy',
				latency: 100,
				message: 'OK'
			});

			const mockSelect = db.select as any;

			// Should only query: active tenants, total users
			// Should NOT query: total tenants, new users today, new apps today, transactions today
			mockSelect
				.mockReturnValueOnce({
					from: vi.fn().mockReturnThis(),
					where: vi.fn().mockResolvedValue([{ count: 5 }])
				}) // active tenants
				.mockReturnValueOnce({
					from: vi.fn().mockResolvedValue([{ count: 100 }])
				}); // total users

			const result = await overviewModule.load({
				locals: {}
			} as any);

			// Verify only used data is present
			expect(result).toHaveProperty('server');
			expect(result).toHaveProperty('database');
			expect(result).toHaveProperty('integrations');
			expect(result).toHaveProperty('platform');

			// These should NOT exist (not used in frontend)
			expect(result.server).not.toHaveProperty('memoryUsage');
			expect(result.platform).not.toHaveProperty('tenants.total');
			expect(result.platform).not.toHaveProperty('users.newToday');
			expect(result.platform).not.toHaveProperty('applications');
			expect(result.platform).not.toHaveProperty('transactions');

			// These SHOULD exist (used in frontend)
			expect(result.server).toHaveProperty('uptime');
			expect(result.platform.tenants).toHaveProperty('active');
			expect(result.platform.users).toHaveProperty('total');
		});
	});

	describe('Integration Health Checks', () => {
		it('should call both integration health checks in parallel', async () => {
			const mockExecute = db.execute as any;
			mockExecute.mockResolvedValueOnce([]);

			const { checkWahaHealth } = await import('../../../src/lib/server/integrations/waha');
			const { checkXenditHealth } = await import('../../../src/lib/server/integrations/xendit');

			const wahaPromise = Promise.resolve({
				status: 'healthy' as const,
				latency: 50,
				message: 'OK'
			});
			const xenditPromise = Promise.resolve({
				status: 'healthy' as const,
				latency: 100,
				message: 'OK'
			});

			vi.mocked(checkWahaHealth).mockReturnValue(wahaPromise);
			vi.mocked(checkXenditHealth).mockReturnValue(xenditPromise);

			const mockSelect = db.select as any;
			mockSelect
				.mockReturnValueOnce({
					from: vi.fn().mockReturnThis(),
					where: vi.fn().mockResolvedValue([{ count: 5 }])
				})
				.mockReturnValueOnce({
					from: vi.fn().mockResolvedValue([{ count: 100 }])
				});

			await overviewModule.load({
				locals: {}
			} as any);

			// Verify both were called
			expect(checkWahaHealth).toHaveBeenCalledTimes(1);
			expect(checkXenditHealth).toHaveBeenCalledTimes(1);
		});
	});
});
