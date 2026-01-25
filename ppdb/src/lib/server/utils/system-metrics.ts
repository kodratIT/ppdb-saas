import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { checkWahaHealth, type HealthCheckResult } from '$lib/server/integrations/waha';
import { checkXenditHealth } from '$lib/server/integrations/xendit';

/**
 * Health check result type
 */
export type HealthStatus = 'healthy' | 'degraded' | 'error' | 'unknown';

export interface HealthCheck {
	status: HealthStatus;
	latency: number;
	error: string | null;
}

export interface ServerMetrics {
	uptime: number;
	memoryUsage?: {
		heapUsed: number;
		heapTotal: number;
		rss: number;
	};
}

export interface IntegrationHealth {
	waha: HealthCheckResult;
	xendit: HealthCheckResult;
}

export interface SystemMetrics {
	server: ServerMetrics;
	database: HealthCheck;
	integrations: IntegrationHealth;
	status: 'operational' | 'degraded';
	timestamp: string;
}

/**
 * Gets comprehensive system metrics including server, database, and integration health
 * @param includeMemoryUsage Whether to include detailed memory usage metrics (default: false)
 * @returns System metrics object
 */
export async function getSystemMetrics(includeMemoryUsage = false): Promise<SystemMetrics> {
	const now = new Date();

	// Server metrics
	const serverMetrics: ServerMetrics = {
		uptime: Math.floor(process.uptime() / 60) // minutes
	};

	if (includeMemoryUsage) {
		serverMetrics.memoryUsage = {
			heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
			heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
			rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
		};
	}

	// Database health
	let dbHealth: HealthCheck = {
		status: 'unknown',
		latency: 0,
		error: null
	};

	try {
		const start = Date.now();
		await db.execute(sql`SELECT 1`);
		dbHealth = { status: 'healthy', latency: Date.now() - start, error: null };
	} catch (e) {
		dbHealth = {
			status: 'error',
			latency: 0,
			error: e instanceof Error ? e.message : 'Unknown'
		};
	}

	// External integrations
	const [wahaHealth, xenditHealth] = await Promise.all([
		checkWahaHealth(),
		checkXenditHealth()
	]);

	// Calculate overall status
	const allHealthy =
		dbHealth.status === 'healthy' &&
		wahaHealth.status === 'healthy' &&
		xenditHealth.status === 'healthy';

	const status = allHealthy ? 'operational' : 'degraded';

	return {
		server: serverMetrics,
		database: dbHealth,
		integrations: { waha: wahaHealth, xendit: xenditHealth },
		status,
		timestamp: now.toISOString()
	};
}
