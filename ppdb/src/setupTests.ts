import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock DB globally
vi.mock('$lib/server/db', () => {
	// Create a mock builder that returns itself for chaining
	const createQueryBuilder = (result: any = []) => {
		const builder: any = {};

		// Chainable methods
		builder.values = vi.fn().mockReturnValue(builder);
		builder.set = vi.fn().mockReturnValue(builder);
		builder.where = vi.fn().mockReturnValue(builder);
		builder.from = vi.fn().mockReturnValue(builder);
		builder.orderBy = vi.fn().mockReturnValue(builder);
		builder.limit = vi.fn().mockReturnValue(builder);
		builder.leftJoin = vi.fn().mockReturnValue(builder);

		// Terminating methods (promises)
		builder.returning = vi.fn().mockResolvedValue(result);
		builder.then = (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject);
		builder.execute = vi.fn().mockResolvedValue({ rows: [{ ok: 1 }] });

		return builder;
	};

	// Entry points return a new builder instance
	const insertFn = vi.fn().mockImplementation(() => createQueryBuilder([{ id: 'mock-id' }]));
	const selectFn = vi.fn().mockImplementation(() => createQueryBuilder([]));
	const updateFn = vi.fn().mockImplementation(() => createQueryBuilder([]));
	const deleteFn = vi.fn().mockImplementation(() => createQueryBuilder([]));

	return {
		db: {
			query: {
				applications: {
					findFirst: vi.fn(),
					findMany: vi.fn()
				},
				customFields: {
					findFirst: vi.fn(),
					findMany: vi.fn()
				},
				invoices: {
					findFirst: vi.fn(),
					findMany: vi.fn()
				},
				paymentProofs: {
					findFirst: vi.fn(),
					findMany: vi.fn()
				},
				users: {
					findFirst: vi.fn()
				}
			},
			insert: insertFn,
			select: selectFn,
			update: updateFn,
			delete: deleteFn,
			execute: vi.fn().mockResolvedValue({ rows: [{ ok: 1 }] }),
			transaction: vi.fn((callback) =>
				callback({
					delete: deleteFn,
					insert: insertFn,
					update: updateFn,
					where: vi.fn().mockReturnValue(createQueryBuilder([])),
					query: {
						invoices: {
							findMany: vi.fn().mockResolvedValue([])
						}
					}
				})
			)
		}
	};
});

// Mock Audit Logger
vi.mock('$lib/server/auth/audit-logger', () => ({
	logSensitiveAction: vi.fn(),
	logAuthorizationFailure: vi.fn(),
	logAuthorizationSuccess: vi.fn(),
	logAuthEvent: vi.fn()
}));

// Mock WAHA Provider
vi.mock('$lib/server/whatsapp/providers/waha', async (importOriginal) => {
	const actual: any = await importOriginal();
	return {
		...actual,
		sendWhatsappMessage: vi.fn().mockResolvedValue({ success: true })
	};
});

// Mock Global Fetch
global.fetch = vi.fn();
