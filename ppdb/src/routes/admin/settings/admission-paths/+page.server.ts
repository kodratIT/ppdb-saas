import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as admissionPathsDomain from '$lib/server/domain/admission-paths';
import { admissionPathCreateSchema, admissionPathUpdateSchema } from '$lib/schema/admission-path';
import { ZodError } from 'zod';

// Mock tenant ID for development (will be replaced with actual tenant resolution)
const MOCK_TENANT_ID = 'tenant-123';

export const load: PageServerLoad = async () => {
	try {
		const paths = await admissionPathsDomain.listAdmissionPaths(db, MOCK_TENANT_ID);

		return {
			paths,
			success: true
		};
	} catch (error) {
		console.error('Error loading admission paths:', error);
		return {
			paths: [],
			success: false,
			error: 'Failed to load admission paths'
		};
	}
};

export const actions: Actions = {
	create: async ({ request }) => {
		try {
			const formData = await request.formData();
			const data = {
				name: formData.get('name'),
				description: formData.get('description') || null,
				quota: Number(formData.get('quota'))
			};

			// Validate with Zod
			const validatedData = admissionPathCreateSchema.parse(data);

			// Create admission path
			const created = await admissionPathsDomain.createAdmissionPath(
				db,
				MOCK_TENANT_ID,
				validatedData
			);

			return {
				success: true,
				message: 'Admission path created successfully',
				path: created
			};
		} catch (error) {
			if (error instanceof ZodError) {
				return fail(400, {
					success: false,
					error: 'Validation failed',
					errors: error.issues
				});
			}

			console.error('Error creating admission path:', error);
			return fail(500, {
				success: false,
				error: 'Failed to create admission path'
			});
		}
	},

	update: async ({ request }) => {
		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;
			const data = {
				name: formData.get('name'),
				description: formData.get('description') || null,
				quota: formData.get('quota') ? Number(formData.get('quota')) : undefined
			};

			// Validate with Zod
			const validatedData = admissionPathUpdateSchema.parse(data);

			// Update admission path
			const updated = await admissionPathsDomain.updateAdmissionPath(
				db,
				MOCK_TENANT_ID,
				pathId,
				validatedData
			);

			return {
				success: true,
				message: 'Admission path updated successfully',
				path: updated
			};
		} catch (error) {
			if (error instanceof ZodError) {
				return fail(400, {
					success: false,
					error: 'Validation failed',
					errors: error.issues
				});
			}

			if (error instanceof admissionPathsDomain.BusinessRuleError) {
				return fail(400, {
					success: false,
					error: error.message
				});
			}

			console.error('Error updating admission path:', error);
			return fail(500, {
				success: false,
				error: 'Failed to update admission path'
			});
		}
	},

	delete: async ({ request }) => {
		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;

			await admissionPathsDomain.deleteAdmissionPath(db, MOCK_TENANT_ID, pathId);

			return {
				success: true,
				message: 'Admission path deleted successfully'
			};
		} catch (error) {
			if (error instanceof admissionPathsDomain.BusinessRuleError) {
				return fail(400, {
					success: false,
					error: error.message
				});
			}

			console.error('Error deleting admission path:', error);
			return fail(500, {
				success: false,
				error: 'Failed to delete admission path'
			});
		}
	},

	publish: async ({ request }) => {
		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;

			const updated = await admissionPathsDomain.publishPath(db, MOCK_TENANT_ID, pathId);

			return {
				success: true,
				message: 'Admission path published successfully',
				path: updated
			};
		} catch (error) {
			if (error instanceof admissionPathsDomain.BusinessRuleError) {
				return fail(400, {
					success: false,
					error: error.message
				});
			}

			console.error('Error publishing admission path:', error);
			return fail(500, {
				success: false,
				error: 'Failed to publish admission path'
			});
		}
	},

	close: async ({ request }) => {
		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;

			const updated = await admissionPathsDomain.closePath(db, MOCK_TENANT_ID, pathId);

			return {
				success: true,
				message: 'Admission path closed successfully',
				path: updated
			};
		} catch (error) {
			if (error instanceof admissionPathsDomain.BusinessRuleError) {
				return fail(400, {
					success: false,
					error: error.message
				});
			}

			console.error('Error closing admission path:', error);
			return fail(500, {
				success: false,
				error: 'Failed to close admission path'
			});
		}
	},

	reopen: async ({ request }) => {
		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;

			const updated = await admissionPathsDomain.reopenPath(db, MOCK_TENANT_ID, pathId);

			return {
				success: true,
				message: 'Admission path reopened successfully',
				path: updated
			};
		} catch (error) {
			if (error instanceof admissionPathsDomain.BusinessRuleError) {
				return fail(400, {
					success: false,
					error: error.message
				});
			}

			console.error('Error reopening admission path:', error);
			return fail(500, {
				success: false,
				error: 'Failed to reopen admission path'
			});
		}
	},

	archive: async ({ request }) => {
		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;

			const updated = await admissionPathsDomain.archivePath(db, MOCK_TENANT_ID, pathId);

			return {
				success: true,
				message: 'Admission path archived successfully',
				path: updated
			};
		} catch (error) {
			if (error instanceof admissionPathsDomain.BusinessRuleError) {
				return fail(400, {
					success: false,
					error: error.message
				});
			}

			console.error('Error archiving admission path:', error);
			return fail(500, {
				success: false,
				error: 'Failed to archive admission path'
			});
		}
	}
};
