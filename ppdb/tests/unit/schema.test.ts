import { describe, it, expect } from 'vitest';
import * as schema from '../../src/lib/server/db/schema';

describe('Database Schema', () => {
	it('should export tenants table definition', () => {
		expect(schema.tenants).toBeDefined();
	});

	it('should export users table definition', () => {
		expect(schema.users).toBeDefined();
	});

	it('should export statusEnum', () => {
		expect(schema.statusEnum).toBeDefined();
	});
});
