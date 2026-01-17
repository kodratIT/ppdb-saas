/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withTenant } from '../../src/lib/server/db/tenant';
import { db } from '../../src/lib/server/db';

// Mock the db module
vi.mock('../../src/lib/server/db', () => ({
	db: {
		transaction: vi.fn()
	}
}));

describe('withTenant', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should execute set_config and callback within a transaction', async () => {
		const tenantId = '123e4567-e89b-12d3-a456-426614174000';
		const mockResult = 'success';
		const mockCallback = vi.fn().mockResolvedValue(mockResult);

		// Mock transaction implementation
		const mockTx = {
			execute: vi.fn()
		};

		(db.transaction as any).mockImplementation(async (cb: any) => {
			return cb(mockTx);
		});

		const result = await withTenant(tenantId, mockCallback);

		expect(db.transaction).toHaveBeenCalled();
		expect(mockTx.execute).toHaveBeenCalled();
		expect(mockCallback).toHaveBeenCalledWith(mockTx);
		expect(result).toBe(mockResult);
	});

	it('should throw error for invalid UUID', async () => {
		const invalidTenantId = 'not-a-uuid';
		const mockCallback = vi.fn();

		await expect(withTenant(invalidTenantId, mockCallback)).rejects.toThrow();
		expect(mockCallback).not.toHaveBeenCalled();
	});
});
