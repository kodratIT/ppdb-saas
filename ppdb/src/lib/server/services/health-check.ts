import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { systemConfigs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getSystemConfigs } from '$lib/server/domain/system-config';

interface HealthCheckResult {
	service: 'waha' | 'xendit';
	status: 'connected' | 'disconnected' | 'error';
	details?: string;
	latency?: number;
}

/**
 * Check WAHA (WhatsApp) connection status
 */
export async function checkWahaHealth(): Promise<HealthCheckResult> {
	const start = Date.now();
	const WAHA_API_URL = env.WAHA_API_URL || 'http://localhost:3000';
	
	try {
		// Ping sessions endpoint to see if we can reach the server
		// GET /api/sessions?all=true
		const response = await fetch(`${WAHA_API_URL}/api/sessions?all=true`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			signal: AbortSignal.timeout(5000) // 5s timeout
		});

		const latency = Date.now() - start;

		if (response.ok) {
			const data = await response.json();
			// Check if there is at least one "WORKING" session
			const hasWorkingSession = Array.isArray(data) && data.some((s: any) => s.status === 'WORKING');
			
			return {
				service: 'waha',
				status: hasWorkingSession ? 'connected' : 'disconnected',
				details: hasWorkingSession 
					? `Connected (${data.length} sessions)` 
					: 'Server reachable but no active session',
				latency
			};
		} else {
			return {
				service: 'waha',
				status: 'disconnected',
				details: `HTTP ${response.status}: ${response.statusText}`,
				latency
			};
		}
	} catch (error) {
		return {
			service: 'waha',
			status: 'error',
			details: error instanceof Error ? error.message : 'Connection failed',
			latency: Date.now() - start
		};
	}
}

/**
 * Check Xendit Payment Gateway status
 */
export async function checkXenditHealth(): Promise<HealthCheckResult> {
	const start = Date.now();
	
	// Get secret key from env or DB (global config)
	// Currently Xendit uses global env variable
	const secretKey = env.XENDIT_SECRET_KEY;

	if (!secretKey) {
		return {
			service: 'xendit',
			status: 'disconnected',
			details: 'XENDIT_SECRET_KEY not configured',
			latency: 0
		};
	}

	try {
		// Check balance endpoint as a lightweight auth check
		// GET https://api.xendit.co/balance
		const response = await fetch('https://api.xendit.co/balance', {
			method: 'GET',
			headers: {
				'Authorization': `Basic ${btoa(secretKey + ':')}`
			},
			signal: AbortSignal.timeout(5000)
		});

		const latency = Date.now() - start;

		if (response.ok) {
			const data = await response.json();
			return {
				service: 'xendit',
				status: 'connected',
				details: `Connected (Balance: ${data.balance?.toLocaleString() || '0'})`,
				latency
			};
		} else {
			// If 401 Unauthorized, key is invalid
			if (response.status === 401) {
				return {
					service: 'xendit',
					status: 'disconnected',
					details: 'Invalid API Key',
					latency
				};
			}
			
			return {
				service: 'xendit',
				status: 'disconnected',
				details: `HTTP ${response.status}: ${response.statusText}`,
				latency
			};
		}
	} catch (error) {
		return {
			service: 'xendit',
			status: 'error',
			details: error instanceof Error ? error.message : 'Connection failed',
			latency: Date.now() - start
		};
	}
}
