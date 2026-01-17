/* eslint-disable @typescript-eslint/no-explicit-any */
import { error } from '@sveltejs/kit';

const XENDIT_API_URL = 'https://api.xendit.co';

export interface CreateInvoiceParams {
	external_id: string;
	amount: number;
	payer_email: string;
	description: string;
	invoice_duration?: number;
	success_redirect_url?: string;
	failure_redirect_url?: string;
}

export interface InvoiceResponse {
	id: string;
	external_id: string;
	user_id: string;
	status: 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED';
	merchant_name: string;
	merchant_profile_picture_url: string;
	amount: number;
	payer_email: string;
	description: string;
	invoice_url: string;
	expiry_date: string;
	available_banks: any[];
	available_retail_outlets: any[];
	available_ewallets: any[];
	available_qr_codes: any[];
}

export async function createInvoice(
	secretKey: string,
	params: CreateInvoiceParams
): Promise<InvoiceResponse> {
	const response = await fetch(`${XENDIT_API_URL}/v2/invoices`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Basic ${btoa(secretKey + ':')}`
		},
		body: JSON.stringify(params)
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		console.error('Xendit Create Invoice Error:', errorData);
		throw error(500, `Payment gateway error: ${errorData.message || response.statusText}`);
	}

	return response.json();
}

export async function getInvoice(secretKey: string, invoiceId: string): Promise<InvoiceResponse> {
	const response = await fetch(`${XENDIT_API_URL}/v2/invoices/${invoiceId}`, {
		method: 'GET',
		headers: {
			Authorization: `Basic ${btoa(secretKey + ':')}`
		}
	});

	if (!response.ok) {
		throw error(500, 'Failed to fetch invoice from gateway');
	}

	return response.json();
}

/**
 * Verifies the Xendit callback token
 * Note: Xendit sends x-callback-token header. We should verify it matches the Verification Token from Dashboard.
 * For per-tenant setup, this is tricky as we might not store the Verification Token.
 * Alternative: Rely on retrieving the invoice status from API to confirm.
 */
export function verifyCallbackToken(headerToken: string, expectedToken: string): boolean {
	return headerToken === expectedToken;
}
