import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as admissionPathsDomain from '$lib/server/domain/admission-paths';
import { admissionPathCreateSchema, admissionPathUpdateSchema } from '$lib/schema/admission-path';
import { ZodError } from 'zod';
import { requireAuth, requirePermission } from '$lib/server/auth/authorization';
import { PERMISSIONS } from '$lib/server/auth/permissions';
import { logSensitiveAction } from '$lib/server/auth/audit-logger';

export const load: PageServerLoad = async ({ locals }) => {
	const { tenantId } = requireAuth(locals);

	try {
		const paths = await admissionPathsDomain.listAdmissionPaths(db, tenantId);

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
	create: async ({ request, locals }) => {
		const { tenantId } = requireAuth(locals);

		try {
			const formData = await request.formData();
			const data = {
				name: formData.get('name'),
				description: formData.get('description') || null,
				quota: Number(formData.get('quota'))
			};

			const validatedData = admissionPathCreateSchema.parse(data);

			const created = await admissionPathsDomain.createAdmissionPath(db, tenantId, validatedData);

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

	update: async ({ request, locals }) => {
		const { tenantId } = requireAuth(locals);

		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;
			const data = {
				name: formData.get('name'),
				description: formData.get('description') || null,
				quota: formData.get('quota') ? Number(formData.get('quota')) : undefined
			};

			const validatedData = admissionPathUpdateSchema.parse(data);

			const updated = await admissionPathsDomain.updateAdmissionPath(
				db,
				tenantId,
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

	delete: async ({ request, locals }) => {
		const { tenantId } = requireAuth(locals);

		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;

			await admissionPathsDomain.deleteAdmissionPath(db, tenantId, pathId);

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

	publish: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requirePermission(auth, PERMISSIONS.ADMISSION_PATHS_PUBLISH);

		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;

			const updated = await admissionPathsDomain.publishPath(db, auth.tenantId, pathId);

			await logSensitiveAction(auth.userId, 'publish_admission_path', pathId, {
				pathName: updated.name
			});

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

	close: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requirePermission(auth, PERMISSIONS.ADMISSION_PATHS_CLOSE);

		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;

			const updated = await admissionPathsDomain.closePath(db, auth.tenantId, pathId);

			await logSensitiveAction(auth.userId, 'close_admission_path', pathId, {
				pathName: updated.name
			});

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

	reopen: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requirePermission(auth, PERMISSIONS.ADMISSION_PATHS_CLOSE);

		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;

			const updated = await admissionPathsDomain.reopenPath(db, auth.tenantId, pathId);

			await logSensitiveAction(auth.userId, 'reopen_admission_path', pathId, {
				pathName: updated.name
			});

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

	archive: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requirePermission(auth, PERMISSIONS.ADMISSION_PATHS_ARCHIVE);

		try {
			const formData = await request.formData();
			const pathId = formData.get('pathId') as string;

			const updated = await admissionPathsDomain.archivePath(db, auth.tenantId, pathId);

			await logSensitiveAction(auth.userId, 'archive_admission_path', pathId, {
				pathName: updated.name
			});

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
