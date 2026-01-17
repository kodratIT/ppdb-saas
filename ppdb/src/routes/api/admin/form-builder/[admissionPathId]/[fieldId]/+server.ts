import { json, error } from '@sveltejs/kit';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { db } from '$lib/server/db';
import * as formBuilderDomain from '$lib/server/domain/form-builder';
import { customFieldSchema } from '$lib/server/domain/form-builder.schema';
import { sanitize } from '$lib/server/utils/sanitizer';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	const { fieldId } = params;
	if (!fieldId) {
		throw error(400, 'Field ID is required');
	}

	const body = await request.json();
	// Use partial for update if needed, but here we expect full update
	const result = customFieldSchema.partial().safeParse(body);

	if (!result.success) {
		throw error(400, {
			message: 'Validation failed',
			errors: result.error.flatten()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
	}

	// Sanitize inputs
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const sanitizedData: any = { ...result.data };
	if (sanitizedData.label) sanitizedData.label = sanitize(sanitizedData.label);
	if (sanitizedData.placeholder) sanitizedData.placeholder = sanitize(sanitizedData.placeholder);
	if (sanitizedData.helpText) sanitizedData.helpText = sanitize(sanitizedData.helpText);
	if (sanitizedData.options) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		sanitizedData.options = sanitizedData.options.map((opt: any) => ({
			...opt,
			label: sanitize(opt.label),
			value: sanitize(opt.value)
		}));
	}

	try {
		const field = await formBuilderDomain.updateField(db, auth.tenantId, fieldId, sanitizedData);
		if (!field) {
			throw error(404, 'Field not found');
		}
		return json(field);
	} catch (e: unknown) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const err = e as any;
		if (err.status) throw err;
		throw error(500, err.message || 'Failed to update field');
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	const { fieldId } = params;
	if (!fieldId) {
		throw error(400, 'Field ID is required');
	}

	try {
		await formBuilderDomain.deleteField(db, auth.tenantId, fieldId);
		return new Response(null, { status: 204 });
	} catch (e: unknown) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		throw error(500, (e as any).message || 'Failed to delete field');
	}
};
