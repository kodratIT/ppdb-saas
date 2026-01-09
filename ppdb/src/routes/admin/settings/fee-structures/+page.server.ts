import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as feeStructuresDomain from '$lib/server/domain/fee-structures';
import { feeStructureCreateSchema, feeStructureUpdateSchema } from '$lib/schema/fee-structure';
import { ZodError } from 'zod';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Mock tenant ID for development (will be replaced with actual tenant resolution)
const MOCK_TENANT_ID = '550e8400-e29b-41d4-a716-446655440000';

export const load: PageServerLoad = async () => {
	try {
		// Get all admission paths for the dropdown
		const admissionPaths = await db
			.select({
				id: schema.admissionPaths.id,
				name: schema.admissionPaths.name,
				quota: schema.admissionPaths.quota,
				status: schema.admissionPaths.status
			})
			.from(schema.admissionPaths)
			.where(eq(schema.admissionPaths.tenantId, MOCK_TENANT_ID));

		// Get all fee structures for this tenant
		const feeStructures = await feeStructuresDomain.listFeeStructures(db, MOCK_TENANT_ID);

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
	createFee: async ({ request }) => {
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

			// Validate with Zod
			const validatedData = feeStructureCreateSchema.parse(data);

			// Create fee structure
			const created = await feeStructuresDomain.createFeeStructure(
				db,
				MOCK_TENANT_ID,
				validatedData
			);

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

	updateFee: async ({ request }) => {
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

			// Validate with Zod
			const validatedData = feeStructureUpdateSchema.parse(data);

			// Update fee structure
			const updated = await feeStructuresDomain.updateFeeStructure(
				db,
				MOCK_TENANT_ID,
				feeId,
				validatedData
			);

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

	deleteFee: async ({ request }) => {
		try {
			const formData = await request.formData();
			const feeId = formData.get('feeId') as string;

			await feeStructuresDomain.deleteFeeStructure(db, MOCK_TENANT_ID, feeId);

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
