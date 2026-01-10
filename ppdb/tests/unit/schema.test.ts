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

	it('should export school_profiles table definition', () => {
		expect(schema.schoolProfiles).toBeDefined();
	});

	it('school_profiles should have required core fields', () => {
		const table = schema.schoolProfiles;
		expect(table).toBeDefined();
		// Check that table has expected columns
		const columns = Object.keys(table);
		expect(columns).toContain('id');
		expect(columns).toContain('tenantId');
		expect(columns).toContain('name');
		expect(columns).toContain('description');
		expect(columns).toContain('contactEmail');
		expect(columns).toContain('contactPhone');
		expect(columns).toContain('logoUrl');
	});

	it('school_profiles should have future expansion fields', () => {
		const table = schema.schoolProfiles;
		expect(table).toBeDefined();
		// Check progressive enhancement fields
		const columns = Object.keys(table);
		expect(columns).toContain('bannerUrl');
		expect(columns).toContain('primaryColor');
		expect(columns).toContain('secondaryColor');
		expect(columns).toContain('address');
	});
});
