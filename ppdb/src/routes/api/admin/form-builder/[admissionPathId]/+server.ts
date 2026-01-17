import { json, error } from '@sveltejs/kit';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { db } from '$lib/server/db';
import * as formBuilderDomain from '$lib/server/domain/form-builder';
import { customFieldSchema } from '$lib/server/domain/form-builder.schema';
import { sanitize } from '$lib/server/utils/sanitizer';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	const { admissionPathId } = params;
	if (!admissionPathId) {
		throw error(400, 'Admission Path ID is required');
	}

	const fields = await formBuilderDomain.listFields(db, auth.tenantId, admissionPathId);

	return json(fields);
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	const { admissionPathId } = params;
	if (!admissionPathId) {
		throw error(400, 'Admission Path ID is required');
	}

	const body = await request.json();
	const result = customFieldSchema.safeParse(body);

	if (!result.success) {
		throw error(400, {
			message: 'Validation failed',
			errors: result.error.flatten()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);
	}

	// Sanitize inputs
	const sanitizedData = {
		...result.data,
		label: sanitize(result.data.label),
		placeholder: result.data.placeholder ? sanitize(result.data.placeholder) : null,
		helpText: result.data.helpText ? sanitize(result.data.helpText) : null,
		options: result.data.options?.map((opt) => ({
			...opt,
			label: sanitize(opt.label),
			value: sanitize(opt.value)
		}))
	};

	try {
		const field = await formBuilderDomain.createField(
			db,
			auth.tenantId,
			admissionPathId,
			sanitizedData
		);
		return json(field, { status: 201 });
	} catch (e: unknown) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		throw error(500, (e as any).message || 'Failed to create field');
	}
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin');

	const { admissionPathId } = params;
	const { fields, step } = await request.json();

	if (!admissionPathId || !fields || !step) {
		throw error(400, 'Admission Path ID, fields, and step are required');
	}

	try {
		const updatedFields = await formBuilderDomain.batchUpdateFields(
			db,
			auth.tenantId,
			admissionPathId,
			step,
			fields
		);
		return json(updatedFields);
	} catch (e: unknown) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		throw error(500, (e as any).message || 'Failed to batch update fields');
	}
};
