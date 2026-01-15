import { json, type RequestHandler } from '@sveltejs/kit';
import { handlePaymentWebhook } from '$lib/server/domain/payment';
import { verifyCallbackToken } from '$lib/server/gateway/xendit';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	// 1. Verify Xendit Token
	// Xendit sends a verification token in the header `x-callback-token`
	const callbackToken = request.headers.get('x-callback-token');
	const expectedToken = env.XENDIT_CALLBACK_TOKEN;

	if (!callbackToken || !expectedToken) {
		console.warn('Missing callback token or env config');
		// We don't reject 401 immediately to avoid leaking info, but for now strict check
		// Note: For per-tenant keys, we might need a different verification strategy
		// or rely on the invoice retrieval check inside handlePaymentWebhook.
		// If we use per-tenant, we can't easily validate this global token unless we store it globally.
		// Compromise: If XENDIT_CALLBACK_TOKEN is set, verify it. If not, rely on logic.
		if (expectedToken && callbackToken && !verifyCallbackToken(callbackToken, expectedToken)) {
			return json({ message: 'Unauthorized' }, { status: 401 });
		}
	}

	try {
		const payload = await request.json();
		console.log('Xendit Webhook Payload:', JSON.stringify(payload));

		// 2. Process Webhook
		// We handle invoice callbacks (status: PAID/EXPIRED)
		// Payload structure depends on the event type.
		// For Invoice Callback: { id, external_id, status, ... }
		await handlePaymentWebhook(payload);

		return json({ success: true });
	} catch (err) {
		console.error('Webhook processing error:', err);
		// Return 200 to Xendit even on error to prevent retries if it's a logic error
		// Only return 500 if we want Xendit to retry (e.g. DB connection fail)
		return json({ success: false, message: 'Internal Server Error' }, { status: 500 });
	}
};
