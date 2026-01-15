import { error, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { paymentProofs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, requireRole } from '$lib/server/auth/authorization';
import { R2Storage } from '$lib/server/storage/r2';

export async function GET({ params, locals, platform }: RequestEvent<{ proofId: string }>) {
	const auth = requireAuth(locals);
	requireRole(auth, 'school_admin', 'super_admin', 'treasurer');

	const { proofId } = params;

	const proof = await db.query.paymentProofs.findFirst({
		where: eq(paymentProofs.id, proofId)
	});

	if (!proof) {
		throw error(404, 'Payment proof not found');
	}

	const isSameTenant = proof.tenantId === auth.tenantId;
	const isSuperAdmin = auth.session.role === 'super_admin';

	if (!isSameTenant && !isSuperAdmin) {
		throw error(403, 'Forbidden');
	}

	if (!proof.imageUrl.startsWith('r2:')) {
		throw error(400, 'Payment proof is not stored in external storage');
	}

	if (!platform?.env?.DOCUMENTS_BUCKET) {
		console.error('R2 Bucket not configured');
		throw error(500, 'Storage service unavailable');
	}

	const key = proof.imageUrl.substring(3);
	const storage = new R2Storage(platform.env.DOCUMENTS_BUCKET);
	const object = await storage.get(key);

	if (!object) {
		throw error(404, 'File not found in storage');
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set('etag', object.httpEtag);

	if (!headers.has('Content-Type')) {
		headers.set('Content-Type', 'image/jpeg');
	}

	return new Response(object.body, {
		headers
	});
}

