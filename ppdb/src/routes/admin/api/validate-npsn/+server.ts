import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateNPSNFormat, checkNPSNExists, validateNPSNWithKemdikbud } from '$lib/server/domain/admin/npsn';

interface ValidateNPSNBody {
    npsn: string;
    excludeId?: string;
}

/**
 * API endpoint for validating NPSN
 * 
 * POST /admin/api/validate-npsn
 * Body: { npsn: string, excludeId?: string }
 * 
 * Returns: { valid: boolean, exists: boolean, message: string, schoolData?: object }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
    // Ensure user is authenticated as super admin
    const session = locals.session;
    if (!session || session.role !== 'super_admin') {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json() as ValidateNPSNBody;
        const { npsn, excludeId } = body;

        if (!npsn) {
            return json({ error: 'Missing NPSN' }, { status: 400 });
        }

        // Validate format
        if (!validateNPSNFormat(npsn)) {
            return json({
                valid: false,
                exists: false,
                message: 'NPSN must be exactly 8 digits'
            });
        }

        // Check if exists in our database
        const existsInDb = await checkNPSNExists(npsn, excludeId);
        if (existsInDb) {
            return json({
                valid: true,
                exists: true,
                message: 'This NPSN is already registered in our system'
            });
        }

        // Validate with Kemdikbud (or mock)
        const kemdikbudResult = await validateNPSNWithKemdikbud(npsn);
        return json(kemdikbudResult);
    } catch (error) {
        console.error('NPSN validation error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

/**
 * GET endpoint for simple NPSN validation
 * 
 * GET /admin/api/validate-npsn?npsn=12345678
 */
export const GET: RequestHandler = async ({ url, locals }) => {
    // Ensure user is authenticated as super admin
    const session = locals.session;
    if (!session || session.role !== 'super_admin') {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const npsn = url.searchParams.get('npsn');
        const excludeId = url.searchParams.get('excludeId');

        if (!npsn) {
            return json({ error: 'Missing NPSN query parameter' }, { status: 400 });
        }

        // Quick format check
        const validFormat = validateNPSNFormat(npsn);
        if (!validFormat) {
            return json({
                valid: false,
                exists: false,
                message: 'NPSN must be exactly 8 digits'
            });
        }

        // Check if exists
        const exists = await checkNPSNExists(npsn, excludeId || undefined);

        return json({
            valid: true,
            exists,
            message: exists ? 'NPSN already registered' : 'NPSN is available'
        });
    } catch (error) {
        console.error('NPSN check error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
