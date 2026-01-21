export interface HealthCheckResult {
	status: 'healthy' | 'degraded' | 'error';
	latency: number;
	message?: string;
}

export async function checkXenditHealth(): Promise<HealthCheckResult> {
	const start = Date.now();
	try {
		const secret = process.env.XENDIT_SECRET_KEY;
		if (!secret) {
			return { status: 'degraded', latency: 0, message: 'API key not configured' };
		}
		const response = await fetch('https://api.xendit.co/balance', {
			method: 'GET',
			headers: { Authorization: `Basic ${btoa(secret + ':')}` },
			signal: AbortSignal.timeout(5000)
		});
		const latency = Date.now() - start;
		if (response.ok) {
			return { status: 'healthy', latency, message: 'Xendit is operational' };
		}
		return { status: 'degraded', latency, message: `Status ${response.status}` };
	} catch (error) {
		return {
			status: 'error',
			latency: Date.now() - start,
			message: error instanceof Error ? error.message : 'Connection failed'
		};
	}
}
