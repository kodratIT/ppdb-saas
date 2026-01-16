import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock DB globally if we don't need real DB connection for unit tests
// If we need integration tests, we should use a separate setup or config
// For unit tests that import files which import DB, we need to mock it to avoid connection errors
vi.mock('$lib/server/db', () => {
	return {
		db: {
			query: {
				applications: {
					findFirst: vi.fn(),
					findMany: vi.fn(),
				},
				customFields: {
					findFirst: vi.fn(),
					findMany: vi.fn(),
				},
				// Add other query builders as needed
			},
			insert: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			update: vi.fn().mockReturnThis(),
			set: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			transaction: vi.fn((callback) => callback({
                delete: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                query: {
                    invoices: {
                        findMany: vi.fn().mockResolvedValue([])
                    }
                }
            })),
		}
	};
});

// Mock Audit Logger to avoid DB calls
vi.mock('$lib/server/auth/audit-logger', () => ({
    logSensitiveAction: vi.fn(),
    logAuthorizationFailure: vi.fn(),
    logAuthEvent: vi.fn()
}));
