import { eq } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../../db/schema';

export type SchoolProfile = typeof schema.schoolProfiles.$inferSelect;
export type NewSchoolProfile = typeof schema.schoolProfiles.$inferInsert;
export type UpdateSchoolProfile = Partial<
	Omit<NewSchoolProfile, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>
>;

/**
 * Get school profile by tenant ID
 * @param db - Database connection
 * @param tenantId - Tenant ID to fetch profile for
 * @returns School profile or null if not found
 */
export async function getSchoolProfileByTenantId(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string
): Promise<SchoolProfile | null> {
	const results = await db
		.select()
		.from(schema.schoolProfiles)
		.where(eq(schema.schoolProfiles.tenantId, tenantId));

	return results[0] || null;
}

/**
 * Update or create school profile for a tenant (upsert)
 * @param db - Database connection
 * @param tenantId - Tenant ID
 * @param data - Profile data to update
 * @returns Updated or created profile
 */
export async function updateSchoolProfile(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	data: UpdateSchoolProfile
): Promise<SchoolProfile> {
	// Try to update first
	const updated = await db
		.update(schema.schoolProfiles)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(schema.schoolProfiles.tenantId, tenantId))
		.returning();

	if (updated.length > 0) {
		return updated[0];
	}

	// If no rows updated, create new profile
	const created = await db
		.insert(schema.schoolProfiles)
		.values({
			tenantId,
			name: data.name || '',
			...data
		})
		.returning();

	return created[0];
}
