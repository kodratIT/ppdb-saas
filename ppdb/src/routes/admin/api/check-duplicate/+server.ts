import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { checkDuplicate, isSlugAvailable, isNameAvailable, generateUniqueSlug } from '$lib/server/domain/admin/npsn';

interface CheckDuplicateBody {
    field: 'name' | 'slug';
    value: string;
    excludeId?: string;
}

/**
 * API endpoint for checking duplicate school names and slugs
 * 
 * POST /admin/api/check-duplicate
 * Body: { field: 'name' | 'slug', value: string, excludeId?: string }
 * 
 * Returns: { exists: boolean, field: string, suggestions?: string[], existingSchool?: object }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    // Ensure user is authenticated as super admin
    const session = locals.session;
    if (!session || session.role !== 'super_admin') {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json() as CheckDuplicateBody;
        const { field, value, excludeId } = body;

        if (!field || !value) {
            return json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!['name', 'slug'].includes(field)) {
            return json({ error: 'Invalid field. Must be "name" or "slug"' }, { status: 400 });
        }

        const result = await checkDuplicate(field, value, excludeId);
        return json(result);
    } catch (error) {
        console.error('Check duplicate error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

/**
 * GET endpoint for simple availability check
 * 
 * GET /admin/api/check-duplicate?field=slug&value=my-school
 */
export const GET: RequestHandler = async ({ url, locals }) => {
    // Ensure user is authenticated as super admin
    const session = locals.session;
    if (!session || session.role !== 'super_admin') {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const field = url.searchParams.get('field');
        const value = url.searchParams.get('value');
        const excludeId = url.searchParams.get('excludeId');

        if (!field || !value) {
            return json({ error: 'Missing required query parameters' }, { status: 400 });
        }

        let available = false;
        if (field === 'slug') {
            available = await isSlugAvailable(value, excludeId || undefined);
        } else if (field === 'name') {
            available = await isNameAvailable(value, excludeId || undefined);
        } else {
            return json({ error: 'Invalid field. Must be "name" or "slug"' }, { status: 400 });
        }

        // Also generate a suggestion if not available
        let suggestion: string | undefined;
        if (!available && field === 'slug') {
            suggestion = await generateUniqueSlug(value);
        }

        return json({ available, suggestion });
    } catch (error) {
        console.error('Check availability error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
