import { eq, and, asc } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';

export async function listFields(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	admissionPathId: string
) {
	return db.query.customFields.findMany({
		where: and(
			eq(schema.customFields.tenantId, tenantId),
			eq(schema.customFields.admissionPathId, admissionPathId)
		),
		with: {
			options: {
				orderBy: [asc(schema.fieldOptions.order)]
			}
		},
		orderBy: [asc(schema.customFields.order)]
	});
}

export async function createField(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	admissionPathId: string,
	data: any
) {
	const { options, ...fieldData } = data;

	return await db.transaction(async (tx) => {
		const [field] = await tx
			.insert(schema.customFields)
			.values({
				...fieldData,
				tenantId,
				admissionPathId
			})
			.returning();

		if (options && options.length > 0) {
			await tx.insert(schema.fieldOptions).values(
				options.map((opt: any) => ({
					...opt,
					customFieldId: field.id
				}))
			);
		}

		return field;
	});
}

export async function batchUpdateFields(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	admissionPathId: string,
	step: number,
	fieldsData: any[]
) {
	return await db.transaction(async (tx) => {
		const existingFields = await tx.query.customFields.findMany({
			where: and(
				eq(schema.customFields.tenantId, tenantId),
				eq(schema.customFields.admissionPathId, admissionPathId),
				eq(schema.customFields.step, step)
			)
		});

		const existingIds = existingFields.map((f) => f.id);
		const incomingIds = fieldsData
			.map((f) => f.id)
			.filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

		// 1. Delete fields that are not in the incoming list
		const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
		for (const id of toDelete) {
			await tx.delete(schema.fieldOptions).where(eq(schema.fieldOptions.customFieldId, id));
			await tx.delete(schema.customFields).where(eq(schema.customFields.id, id));
		}

		// 2. Update or Create
		const results = [];
		for (const field of fieldsData) {
			const { options, id: fieldId, ...fieldData } = field;
			const isNew = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
				fieldId
			);

			if (isNew) {
				// Create
				const [newField] = await tx
					.insert(schema.customFields)
					.values({
						...fieldData,
						tenantId,
						admissionPathId,
						step
					})
					.returning();

				if (options?.length > 0) {
					await tx.insert(schema.fieldOptions).values(
						options.map((opt: any) => ({
							label: opt.label,
							value: opt.value,
							order: opt.order,
							customFieldId: newField.id
						}))
					);
				}
				results.push(newField);
			} else {
				// Update
				const [updatedField] = await tx
					.update(schema.customFields)
					.set({
						...fieldData,
						updatedAt: new Date()
					})
					.where(
						and(eq(schema.customFields.id, fieldId), eq(schema.customFields.tenantId, tenantId))
					)
					.returning();

				if (options) {
					await tx
						.delete(schema.fieldOptions)
						.where(eq(schema.fieldOptions.customFieldId, fieldId));

					if (options.length > 0) {
						await tx.insert(schema.fieldOptions).values(
							options.map((opt: any) => ({
								label: opt.label,
								value: opt.value,
								order: opt.order,
								customFieldId: fieldId
							}))
						);
					}
				}
				results.push(updatedField);
			}
		}

		return results;
	});
}

export async function updateField(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	fieldId: string,
	data: any
) {
	const { options, ...fieldData } = data;

	return await db.transaction(async (tx) => {
		const [field] = await tx
			.update(schema.customFields)
			.set({
				...fieldData,
				updatedAt: new Date()
			})
			.where(and(eq(schema.customFields.id, fieldId), eq(schema.customFields.tenantId, tenantId)))
			.returning();

		if (!field) return null;

		if (options) {
			// Replace options: delete then insert
			await tx.delete(schema.fieldOptions).where(eq(schema.fieldOptions.customFieldId, fieldId));

			if (options.length > 0) {
				await tx.insert(schema.fieldOptions).values(
					options.map((opt: any) => ({
						...opt,
						customFieldId: fieldId
					}))
				);
			}
		}

		return field;
	});
}

export async function deleteField(
	db: NeonHttpDatabase<typeof schema>,
	tenantId: string,
	fieldId: string
) {
	return db
		.delete(schema.customFields)
		.where(and(eq(schema.customFields.id, fieldId), eq(schema.customFields.tenantId, tenantId)));
}
