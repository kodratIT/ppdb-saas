import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import {
	listTenantsWithStats,
	updateTenantStatus,
	getEnhancedStats,
	deleteTenant
} from '$lib/server/domain/admin';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { PAGINATION_LIMIT } from '$lib/constants/admin';
import { ERROR_MESSAGES, createErrorResponse } from '$lib/constants/errors';

export const load: PageServerLoad = async ({ locals, url, depends }) => {
	try {
		const auth = await requireAuth(locals);
		requireSuperAdmin(auth);

		depends('admin:tenants');

		const search = url.searchParams.get('search') || undefined;
		const searchField = (url.searchParams.get('searchField') as 'all' | 'name' | 'slug') || 'all';
		const searchOperator =
			(url.searchParams.get('searchOperator') as 'contains' | 'starts_with' | 'exact') ||
			'contains';
		const status = url.searchParams.get('status') || 'all';
		const type = url.searchParams.get('type') || 'all';
		const timeframe = url.searchParams.get('timeframe') || 'all';
		const page = Number(url.searchParams.get('page')) || 1;
		const limit = Number(url.searchParams.get('limit')) || PAGINATION_LIMIT;
		const sortBy = url.searchParams.get('sortBy') || 'createdAt';
		const sortOrder = (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

		const [tenants, enhancedStats] = await Promise.all([
			listTenantsWithStats({
				search,
				searchField,
				searchOperator,
				status,
				type,
				timeframe,
				page,
				limit,
				sortBy,
				sortOrder
			}),
			getEnhancedStats()
		]);

		return { tenants, enhancedStats };
	} catch (error) {
		console.error('Failed to load tenants:', error);
		throw error; // Let SvelteKit handle the error page
	}
};

export const actions: Actions = {
	toggleStatus: async ({ request, locals }) => {
		try {
			const auth = await requireAuth(locals);
			requireSuperAdmin(auth);

			const formData = await request.formData();
			const tenantId = formData.get('tenantId')?.toString();
			const currentStatus = formData.get('currentStatus')?.toString();

			if (!tenantId || !currentStatus) {
				return fail(400, createErrorResponse(ERROR_MESSAGES.MISSING_DATA, 'VALIDATION_ERROR'));
			}

			const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

			await updateTenantStatus(tenantId, newStatus, auth.userId);

			return {
				success: true,
				message: `School ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
			};
		} catch (error) {
			console.error('Toggle status failed:', error);

			// Check for specific error types
			if (error instanceof Error) {
				if (error.message.includes('not found')) {
					return fail(404, createErrorResponse(ERROR_MESSAGES.TENANT_NOT_FOUND, 'NOT_FOUND'));
				}
				if (error.message.includes('permission') || error.message.includes('unauthorized')) {
					return fail(403, createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 'UNAUTHORIZED'));
				}
			}

			return fail(
				500,
				createErrorResponse(ERROR_MESSAGES.UPDATE_FAILED, 'SERVER_ERROR', {
					error: error instanceof Error ? error.message : 'Unknown error'
				})
			);
		}
	},

	bulkUpdateStatus: async ({ request, locals }) => {
		try {
			const auth = await requireAuth(locals);
			requireSuperAdmin(auth);

			const formData = await request.formData();
			const tenantIds = formData.get('tenantIds')?.toString();
			const newStatus = formData.get('status')?.toString() as 'active' | 'inactive';

			if (!tenantIds || !newStatus) {
				return fail(400, createErrorResponse(ERROR_MESSAGES.MISSING_DATA, 'VALIDATION_ERROR'));
			}

			const ids = JSON.parse(tenantIds) as string[];

			if (ids.length === 0) {
				return fail(400, createErrorResponse('No schools selected', 'VALIDATION_ERROR'));
			}

			const results = await Promise.allSettled(
				ids.map((id) => updateTenantStatus(id, newStatus, auth.userId))
			);

			const successCount = results.filter((r) => r.status === 'fulfilled').length;
			const failureCount = results.filter((r) => r.status === 'rejected').length;
			const failures = results
				.map((r, i) => ({ id: ids[i], result: r }))
				.filter((item) => item.result.status === 'rejected')
				.map((item) => ({
					id: item.id,
					error: item.result.status === 'rejected' ? item.result.reason : 'Unknown error'
				}));

			return {
				success: true,
				successCount,
				failureCount,
				failures,
				message: `${successCount} school(s) ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`
			};
		} catch (error) {
			console.error('Bulk update failed:', error);
			return fail(
				500,
				createErrorResponse(ERROR_MESSAGES.UPDATE_FAILED, 'SERVER_ERROR', {
					error: error instanceof Error ? error.message : 'Unknown error'
				})
			);
		}
	},

	exportSchools: async ({ request, locals, url }) => {
		try {
			const auth = await requireAuth(locals);
			requireSuperAdmin(auth);

			// Get current filters from URL
			const search = url.searchParams.get('search') || undefined;
			const searchField = (url.searchParams.get('searchField') as 'all' | 'name' | 'slug') || 'all';
			const searchOperator =
				(url.searchParams.get('searchOperator') as 'contains' | 'starts_with' | 'exact') ||
				'contains';
			const status = url.searchParams.get('status') || 'all';

			// Fetch all schools matching filters (no pagination for export)
			const result = await listTenantsWithStats({
				search,
				searchField,
				searchOperator,
				status,
				page: 1,
				limit: 10000, // Large limit to get all schools
				sortBy: 'createdAt',
				sortOrder: 'desc'
			});

			return {
				success: true,
				schools: result.data,
				count: result.total
			};
		} catch (error) {
			console.error('Export failed:', error);
			return fail(
				500,
				createErrorResponse('Failed to export schools', 'SERVER_ERROR', {
					error: error instanceof Error ? error.message : 'Unknown error'
				})
			);
		}
	},

	deleteTenant: async ({ request, locals }) => {
		try {
			const auth = await requireAuth(locals);
			requireSuperAdmin(auth);

			const formData = await request.formData();
			const tenantId = formData.get('tenantId')?.toString();

			if (!tenantId) {
				return fail(400, createErrorResponse(ERROR_MESSAGES.MISSING_DATA, 'VALIDATION_ERROR'));
			}

			await deleteTenant(tenantId, auth.userId);

			return {
				success: true,
				message: 'School deleted successfully'
			};
		} catch (error) {
			console.error('Delete school failed:', error);
			return fail(
				500,
				createErrorResponse('Failed to delete school', 'SERVER_ERROR', {
					error: error instanceof Error ? error.message : 'Unknown error'
				})
			);
		}
	}
};
