import { db } from '$lib/server/db';
import { customFields, fieldOptions } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { encrypt, decrypt } from '$lib/server/utils/crypto';

export async function processCustomFieldsForSave(
	tenantId: string,
	admissionPathId: string | null,
	values: Record<string, any>
) {
	// Fetch custom field definitions to know which are encrypted
	const fields = await db.query.customFields.findMany({
		where: and(
			eq(customFields.tenantId, tenantId),
			admissionPathId ? eq(customFields.admissionPathId, admissionPathId) : undefined
		)
	});

	const processed: Record<string, any> = {};
	const encryptedKeys = new Set(fields.filter((f) => f.isEncrypted).map((f) => f.key));
	const allKeys = new Set(fields.map((f) => f.key));

	for (const [key, value] of Object.entries(values)) {
		// Only process if it matches a known custom field key
		if (allKeys.has(key)) {
			if (encryptedKeys.has(key) && value) {
				// Encrypt the value
				// Ensure value is string
				const strValue = String(value);
				processed[key] = encrypt(strValue);
			} else {
				processed[key] = value;
			}
		}
	}
	return processed;
}

export async function processCustomFieldsForDisplay(
	tenantId: string,
	admissionPathId: string | null,
	values: Record<string, any>
) {
	const fields = await db.query.customFields.findMany({
		where: and(
			eq(customFields.tenantId, tenantId),
			admissionPathId ? eq(customFields.admissionPathId, admissionPathId) : undefined
		)
	});

	const processed: Record<string, any> = { ...values };
	const encryptedKeys = new Set(fields.filter((f) => f.isEncrypted).map((f) => f.key));

	for (const key of Object.keys(processed)) {
		if (encryptedKeys.has(key) && processed[key]) {
			try {
				processed[key] = decrypt(processed[key]);
			} catch (e) {
				// Keep original if decryption fails (might be unencrypted legacy data)
				console.warn(`Failed to decrypt field ${key}:`, e);
			}
		}
	}
	return processed;
}

export async function getCustomFieldsForStep(
	tenantId: string,
	admissionPathId: string,
	step: number
) {
	return await db.query.customFields.findMany({
		where: and(
			eq(customFields.tenantId, tenantId),
			eq(customFields.admissionPathId, admissionPathId),
			eq(customFields.step, step)
		),
		with: {
			options: {
				orderBy: asc(fieldOptions.order)
			}
		},
		orderBy: asc(customFields.order)
	});
}
