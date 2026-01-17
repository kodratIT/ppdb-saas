import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as feeStructuresDomain from '$lib/server/domain/fee-structures';
import { feeStructureCreateSchema, feeStructureUpdateSchema } from '$lib/schema/fee-structure';
import { ZodError } from 'zod';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requirePermission } from '$lib/server/auth/authorization';
import { PERMISSIONS } from '$lib/server/auth/permissions';
import { logSensitiveAction } from '$lib/server/auth/audit-logger';

export const load: PageServerLoad = async ({ locals }) => {
	const { tenantId } = requireAuth(locals);

	try {
		const admissionPaths = await db
			.select({
				id: schema.admissionPaths.id,
				name: schema.admissionPaths.name,
				quota: schema.admissionPaths.quota,
				status: schema.admissionPaths.status
			})
			.from(schema.admissionPaths)
			.where(eq(schema.admissionPaths.tenantId, tenantId));

		const feeStructures = await feeStructuresDomain.listFeeStructures(db, tenantId);

		return {
			admissionPaths,
			feeStructures,
			success: true
		};
	} catch (error) {
		console.error('Error loading fee structures:', error);
		return {
			admissionPaths: [],
			feeStructures: [],
			success: false,
			error: 'Failed to load fee structures'
		};
	}
};

export const actions: Actions = {
	createFee: async ({ request, locals }) => {
		const auth = requireAuth(locals);

		requirePermission(auth, PERMISSIONS.FEES_CREATE);

		try {
			const formData = await request.formData();
			const data = {
				admissionPathId: formData.get('admissionPathId'),
				name: formData.get('name'),
				description: formData.get('description') || null,
				amount: formData.get('amount') ? Number(formData.get('amount')) : undefined,
				currency: formData.get('currency') || 'IDR',
				paymentTiming: formData.get('paymentTiming') || 'registration',
				dueDateOffsetDays: formData.get('dueDateOffsetDays')
					? Number(formData.get('dueDateOffsetDays'))
					: 0,
				penaltyAmount: formData.get('penaltyAmount') ? Number(formData.get('penaltyAmount')) : null,
				penaltyGraceDays: formData.get('penaltyGraceDays')
					? Number(formData.get('penaltyGraceDays'))
					: null,
				status: formData.get('status') || 'active'
			};

			const validatedData = feeStructureCreateSchema.parse(data);

			const created = await feeStructuresDomain.createFeeStructure(
				db,
				auth.tenantId,
				validatedData
			);

			await logSensitiveAction(auth.userId, 'create_fee_structure', created.id, {
				feeName: created.name,
				admissionPathId: validatedData.admissionPathId
			});

			return {
				success: true,
				message: 'Fee structure created successfully',
				fee: created
			};
		} catch (error) {
			if (error instanceof ZodError) {
				return fail(400, {
					success: false,
					error: 'Validation failed',
					errors: error.issues
				});
			}

			console.error('Error creating fee structure:', error);
			return fail(500, {
				success: false,
				error: 'Failed to create fee structure'
			});
		}
	},

	updateFee: async ({ request, locals }) => {
		const auth = requireAuth(locals);

		requirePermission(auth, PERMISSIONS.FEES_UPDATE);

		try {
			const formData = await request.formData();
			const feeId = formData.get('feeId') as string;
			const data = {
				admissionPathId: formData.get('admissionPathId') || undefined,
				name: formData.get('name') || undefined,
				description: formData.get('description') || null,
				amount: formData.get('amount') ? Number(formData.get('amount')) : undefined,
				currency: formData.get('currency') || undefined,
				paymentTiming: formData.get('paymentTiming') || undefined,
				dueDateOffsetDays: formData.get('dueDateOffsetDays')
					? Number(formData.get('dueDateOffsetDays'))
					: undefined,
				penaltyAmount: formData.get('penaltyAmount') ? Number(formData.get('penaltyAmount')) : null,
				penaltyGraceDays: formData.get('penaltyGraceDays')
					? Number(formData.get('penaltyGraceDays'))
					: null,
				status: formData.get('status') || undefined
			};

			const validatedData = feeStructureUpdateSchema.parse(data);

			const updated = await feeStructuresDomain.updateFeeStructure(
				db,
				auth.tenantId,
				feeId,
				validatedData
			);

			await logSensitiveAction(auth.userId, 'update_fee_structure', feeId, {
				feeName: updated.name,
				changes: data
			});

			return {
				success: true,
				message: 'Fee structure updated successfully',
				fee: updated
			};
		} catch (error) {
			if (error instanceof ZodError) {
				return fail(400, {
					success: false,
					error: 'Validation failed',
					errors: error.issues
				});
			}

			if (error instanceof feeStructuresDomain.BusinessRuleError) {
				return fail(400, {
					success: false,
					error: error.message
				});
			}

			console.error('Error updating fee structure:', error);
			return fail(500, {
				success: false,
				error: 'Failed to update fee structure'
			});
		}
	},

	deleteFee: async ({ request, locals }) => {
		const auth = requireAuth(locals);

		requirePermission(auth, PERMISSIONS.FEES_DELETE);

		try {
			const formData = await request.formData();
			const feeId = formData.get('feeId') as string;

			await feeStructuresDomain.deleteFeeStructure(db, auth.tenantId, feeId);

			await logSensitiveAction(auth.userId, 'delete_fee_structure', feeId, {
				tenantId: auth.tenantId
			});

			return {
				success: true,
				message: 'Fee structure deleted successfully'
			};
		} catch (error) {
			if (error instanceof feeStructuresDomain.BusinessRuleError) {
				return fail(400, {
					success: false,
					error: error.message
				});
			}

			console.error('Error deleting fee structure:', error);
			return fail(500, {
				success: false,
				error: 'Failed to delete fee structure'
			});
		}
	}
};
