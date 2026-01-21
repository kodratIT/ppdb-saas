export interface HealthCheckResult {
	status: 'healthy' | 'degraded' | 'error';
	latency: number;
	message?: string;
}

export async function checkWahaHealth(): Promise<HealthCheckResult> {
	const start = Date.now();
	try {
		const wahaUrl = process.env.WAHA_URL || 'http://localhost:3000';
		const response = await fetch(`${wahaUrl}/api/health`, {
			method: 'GET',
			signal: AbortSignal.timeout(5000)
		});
		const latency = Date.now() - start;
		if (response.ok) {
			return { status: 'healthy', latency, message: 'WAHA is operational' };
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
