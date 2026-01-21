import { db } from '$lib/server/db';
import { tenants } from '$lib/server/db/schema';
import { eq, ilike } from 'drizzle-orm';

/**
 * NPSN Validation and School Duplicate Detection
 * 
 * This module provides APIs for:
 * 1. Checking if a school name/slug already exists
 * 2. Validating NPSN format and uniqueness
 * 3. (Future) Integration with Kemdikbud NPSN API
 */

export interface DuplicateCheckResult {
    exists: boolean;
    field: 'name' | 'slug' | 'npsn';
    suggestions?: string[];
    existingSchool?: {
        name: string;
        slug: string;
    };
}

export interface NPSNValidationResult {
    valid: boolean;
    exists: boolean;
    message: string;
    schoolData?: {
        name: string;
        level: string;
        address: string;
        province: string;
        city: string;
    };
}

/**
 * Check if a school with the given name or slug already exists
 */
export async function checkDuplicate(
    field: 'name' | 'slug',
    value: string,
    excludeId?: string
): Promise<DuplicateCheckResult> {
    if (!value || value.trim().length === 0) {
        return { exists: false, field };
    }

    const normalizedValue = value.trim().toLowerCase();

    try {
        let query;
        if (field === 'name') {
            query = db
                .select({ id: tenants.id, name: tenants.name, slug: tenants.slug })
                .from(tenants)
                .where(ilike(tenants.name, normalizedValue));
        } else {
            query = db
                .select({ id: tenants.id, name: tenants.name, slug: tenants.slug })
                .from(tenants)
                .where(eq(tenants.slug, normalizedValue));
        }

        const results = await query;

        // Filter out the excluded ID (for edit scenarios)
        const filtered = excludeId
            ? results.filter((r: { id: string }) => r.id !== excludeId)
            : results;

        if (filtered.length === 0) {
            return { exists: false, field };
        }

        // Generate alternative slug suggestions
        const suggestions: string[] = [];
        if (field === 'slug') {
            const baseSlug = normalizedValue.replace(/-\d+$/, '');
            for (let i = 1; i <= 3; i++) {
                const suggestion = `${baseSlug}-${i}`;
                // Check if suggestion is available
                const checkResult = await db
                    .select({ id: tenants.id })
                    .from(tenants)
                    .where(eq(tenants.slug, suggestion));
                if (checkResult.length === 0) {
                    suggestions.push(suggestion);
                }
            }
        }

        return {
            exists: true,
            field,
            suggestions,
            existingSchool: {
                name: filtered[0].name,
                slug: filtered[0].slug
            }
        };
    } catch (error) {
        console.error('Duplicate check error:', error);
        throw error;
    }
}

/**
 * Check if a slug is available
 */
export async function isSlugAvailable(
    slug: string,
    excludeId?: string
): Promise<boolean> {
    const result = await checkDuplicate('slug', slug, excludeId);
    return !result.exists;
}

/**
 * Check if a school name is available
 */
export async function isNameAvailable(
    name: string,
    excludeId?: string
): Promise<boolean> {
    const result = await checkDuplicate('name', name, excludeId);
    return !result.exists;
}

/**
 * Validate NPSN format (must be 8 digits)
 */
export function validateNPSNFormat(npsn: string): boolean {
    if (!npsn) return false;
    const cleaned = npsn.trim();
    return /^\d{8}$/.test(cleaned);
}

/**
 * Check if NPSN already exists in our database
 * Note: This requires a npsn column on the tenants table or schoolProfiles
 * For now, we return false since we can't check directly
 */
export async function checkNPSNExists(
    _npsn: string,
    _excludeId?: string
): Promise<boolean> {
    // TODO: Once NPSN field is available on tenants/schoolProfiles, implement this
    // For now, return false to skip this check
    return false;
}

/**
 * Validate NPSN against Kemdikbud API (placeholder)
 * 
 * In production, this would call the actual Kemdikbud API:
 * https://dapo.kemdikbud.go.id/sp/[npsn]
 * 
 * For now, this is a mock implementation.
 */
export async function validateNPSNWithKemdikbud(
    npsn: string
): Promise<NPSNValidationResult> {
    // Validate format first
    if (!validateNPSNFormat(npsn)) {
        return {
            valid: false,
            exists: false,
            message: 'NPSN must be exactly 8 digits'
        };
    }

    // Check if already in our database
    const existsInDb = await checkNPSNExists(npsn);
    if (existsInDb) {
        return {
            valid: true,
            exists: true,
            message: 'This NPSN is already registered in our system'
        };
    }

    // TODO: Implement actual Kemdikbud API call
    // For now, return a mock response

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock: Assume all valid format NPSNs are valid
    // In production, this would verify against Kemdikbud database
    return {
        valid: true,
        exists: false,
        message: 'NPSN format is valid',
        // Mock school data - in production this comes from Kemdikbud
        schoolData: undefined
    };
}

/**
 * Generate a unique slug from a school name
 */
export async function generateUniqueSlug(name: string): Promise<string> {
    // Convert name to slug format
    let baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Check if base slug is available
    if (await isSlugAvailable(baseSlug)) {
        return baseSlug;
    }

    // Try with number suffixes
    for (let i = 1; i <= 100; i++) {
        const candidateSlug = `${baseSlug}-${i}`;
        if (await isSlugAvailable(candidateSlug)) {
            return candidateSlug;
        }
    }

    // Fallback: add random string
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${baseSlug}-${randomSuffix}`;
}
