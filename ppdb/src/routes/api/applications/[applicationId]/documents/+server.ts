import { json, error, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { applicationDocuments, applications } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { encrypt } from '$lib/server/utils/crypto';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { R2Storage } from '$lib/server/storage/r2';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST({ request, locals, params, platform }: RequestEvent<{ applicationId: string }>) {
	const auth = await requireAuth(locals);
	await requireRole(auth, 'parent');

	const { applicationId } = params;

	// Verify ownership
	const application = await db.query.applications.findFirst({
		where: and(
			eq(applications.id, applicationId),
			eq(applications.userId, auth.userId),
			eq(applications.tenantId, auth.tenantId)
		)
	});

	if (!application) {
		throw error(404, 'Aplikasi pendaftaran tidak ditemukan');
	}

	const formData = await request.formData();
	const file = formData.get('file') as File;
	const documentType = formData.get('documentType') as string;
	const thumbnail = formData.get('thumbnail') as string | null;

	if (!file) {
		throw error(400, 'File tidak ditemukan');
	}

	if (!documentType) {
		throw error(400, 'Tipe dokumen harus ditentukan');
	}

	// Validate file
	if (!ALLOWED_TYPES.includes(file.type)) {
		throw error(400, 'Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP');
	}

	if (file.size > MAX_FILE_SIZE) {
		throw error(400, 'Ukuran file terlalu besar. Maksimal 10MB');
	}

	try {
		let fileUrl: string;

		if (platform?.env?.DOCUMENTS_BUCKET) {
			const storage = new R2Storage(platform.env.DOCUMENTS_BUCKET);
			// Unique key: tenants/{tenantId}/applications/{applicationId}/{timestamp}-{random}-{filename}
			// Sanitize filename to avoid issues with special characters in URL
			const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
			const key = `tenants/${auth.tenantId}/applications/${applicationId}/${Date.now()}-${crypto.randomUUID()}-${safeFilename}`;

			await storage.upload(key, new Uint8Array(await file.arrayBuffer()), {
				httpMetadata: { contentType: file.type }
			});

			fileUrl = `r2:${key}`;
		} else {
			// Fallback: Store encrypted base64 in database (Legacy/Dev)
			// Convert file to buffer
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			// Encrypt file content (AES-256)
			const encryptedContent = encrypt(buffer.toString('base64'));
			fileUrl = `encrypted:${encryptedContent}`;
		}

		// Save to database
		const [document] = await db
			.insert(applicationDocuments)
			.values({
				applicationId,
				tenantId: auth.tenantId,
				documentType: documentType as any,
				fileName: file.name,
				fileSize: file.size,
				mimeType: file.type,
				encryptedUrl: fileUrl,
				thumbnailUrl: thumbnail || null,
				status: 'pending'
			})
			.returning();

		return json({
			success: true,
			documentId: document.id,
			fileName: file.name,
			fileSize: file.size
		});
	} catch (err) {
		console.error('Document upload error:', err);
		throw error(500, 'Gagal mengunggah dokumen. Silakan coba lagi');
	}
}

// Get documents for an application
export async function GET({ locals, params }: RequestEvent<{ applicationId: string }>) {
	const auth = await requireAuth(locals);
	await requireRole(auth, 'parent');

	const { applicationId } = params;

	// Verify ownership
	const application = await db.query.applications.findFirst({
		where: and(
			eq(applications.id, applicationId),
			eq(applications.userId, auth.userId),
			eq(applications.tenantId, auth.tenantId)
		)
	});

	if (!application) {
		throw error(404, 'Aplikasi pendaftaran tidak ditemukan');
	}

	const documents = await db.query.applicationDocuments.findMany({
		where: and(
			eq(applicationDocuments.applicationId, applicationId),
			eq(applicationDocuments.tenantId, auth.tenantId)
		)
	});

	return json({ documents });
}

// Delete a document
export async function DELETE({ request, locals, params, platform }: RequestEvent<{ applicationId: string }>) {
	const auth = await requireAuth(locals);
	await requireRole(auth, 'parent');

	const { applicationId } = params;
	const { documentId } = (await request.json()) as { documentId: string };

	if (!documentId) {
		throw error(400, 'Document ID harus disediakan');
	}

	// Verify ownership through application
	const application = await db.query.applications.findFirst({
		where: and(
			eq(applications.id, applicationId),
			eq(applications.userId, auth.userId),
			eq(applications.tenantId, auth.tenantId)
		)
	});

	if (!application) {
		throw error(404, 'Aplikasi pendaftaran tidak ditemukan');
	}

	// Find document to delete (need to check if it's in R2)
	const document = await db.query.applicationDocuments.findFirst({
		where: and(
			eq(applicationDocuments.id, documentId),
			eq(applicationDocuments.applicationId, applicationId),
			eq(applicationDocuments.tenantId, auth.tenantId)
		)
	});

	if (document) {
		// Delete from R2 if applicable
		if (
			document.encryptedUrl.startsWith('r2:') &&
			platform?.env?.DOCUMENTS_BUCKET
		) {
			const key = document.encryptedUrl.substring(3);
			const storage = new R2Storage(platform.env.DOCUMENTS_BUCKET);
			await storage.delete(key);
		}

		// Delete from database
		await db
			.delete(applicationDocuments)
			.where(
				and(
					eq(applicationDocuments.id, documentId),
					eq(applicationDocuments.applicationId, applicationId),
					eq(applicationDocuments.tenantId, auth.tenantId)
				)
			);
	}

	return json({ success: true });
}
