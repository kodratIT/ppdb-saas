import { error, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { applicationDocuments } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { decrypt } from '$lib/server/utils/crypto';
import { requireAuth } from '$lib/server/auth/authorization';
import { R2Storage } from '$lib/server/storage/r2';

export async function GET({ params, locals, platform }: RequestEvent<{ documentId: string }>) {
	const auth = await requireAuth(locals);
	const { documentId } = params;

	const document = await db.query.applicationDocuments.findFirst({
		where: eq(applicationDocuments.id, documentId),
		with: {
			application: true
		}
	});

	if (!document) {
		throw error(404, 'Dokumen tidak ditemukan');
	}

	// Access Control
	// 1. Owner (Parent)
	// 2. Admin/Verifier of the same tenant
	// 3. Super Admin
	const isOwner =
		document.application.userId === auth.userId && document.tenantId === auth.tenantId;
	const isStaff =
		document.tenantId === auth.tenantId && ['admin', 'verifier'].includes(auth.session.role || '');
	const isSuperAdmin = auth.session.role === 'super_admin';

	if (!isOwner && !isStaff && !isSuperAdmin) {
		throw error(403, 'Akses ditolak');
	}

	try {
		if (document.encryptedUrl.startsWith('r2:')) {
			if (!platform?.env?.DOCUMENTS_BUCKET) {
				console.error('R2 Bucket not configured');
				throw error(500, 'Storage service unavailable');
			}

			const key = document.encryptedUrl.substring(3);
			const storage = new R2Storage(platform.env.DOCUMENTS_BUCKET);
			const object = await storage.get(key);

			if (!object) {
				throw error(404, 'File tidak ditemukan di storage');
			}

			const headers = new Headers();
			object.writeHttpMetadata(headers);
			headers.set('etag', object.httpEtag);
			// Ensure Content-Type is set if R2 didn't return it (though writeHttpMetadata should)
			if (!headers.has('Content-Type')) {
				headers.set('Content-Type', document.mimeType);
			}

			return new Response(object.body, {
				headers
			});
		} else if (document.encryptedUrl.startsWith('encrypted:')) {
			// Legacy: Decrypt from DB
			const encryptedContent = document.encryptedUrl.substring(10);
			const decryptedBase64 = decrypt(encryptedContent);
			const buffer = Buffer.from(decryptedBase64, 'base64');

			return new Response(buffer, {
				headers: {
					'Content-Type': document.mimeType,
					'Content-Length': buffer.length.toString(),
					'Cache-Control': 'private, max-age=3600'
				}
			});
		}

		throw error(500, 'Format penyimpanan tidak dikenali');
	} catch (err) {
		console.error('Download error:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		throw error(500, 'Gagal mengambil dokumen');
	}
}
