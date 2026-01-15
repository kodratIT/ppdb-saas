import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as verificationDomain from '../../src/lib/server/domain/verification';
import { db } from '../../src/lib/server/db';

// Mock the db module
vi.mock('../../src/lib/server/db', () => ({
	db: {
		query: {
			applications: {
				findMany: vi.fn(),
				findFirst: vi.fn()
			},
			applicationDocuments: {
				findMany: vi.fn(),
				findFirst: vi.fn()
			}
		},
		transaction: vi.fn((cb) => {
			const mockTx = {
				query: {
					applicationDocuments: {
						findFirst: vi.fn(),
						findMany: vi.fn()
					}
				},
				update: vi.fn().mockReturnThis(),
				set: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				insert: vi.fn().mockReturnThis(),
				values: vi.fn().mockReturnThis()
			};
			return cb(mockTx);
		})
	}
}));

describe('Verification Domain Logic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getVerificationQueue', () => {
		it('should return pending applications', async () => {
			const tenantId = 'tenant-1';
			const mockApps = [{ id: 'app-1', status: 'submitted' }];

			(db.query.applications.findMany as any).mockResolvedValue(mockApps);

			const result = await verificationDomain.getVerificationQueue(tenantId);

			expect(db.query.applications.findMany).toHaveBeenCalled();
			expect(result).toEqual(mockApps);
		});
	});

	describe('getApplicationForVerification', () => {
		it('should return application details', async () => {
			const appId = 'app-1';
			const mockApp = { id: appId, childFullName: 'Test Child' };

			(db.query.applications.findFirst as any).mockResolvedValue(mockApp);

			const result = await verificationDomain.getApplicationForVerification(appId);

			expect(db.query.applications.findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.anything(),
					with: expect.anything()
				})
			);
			expect(result).toEqual(mockApp);
		});
	});
});
