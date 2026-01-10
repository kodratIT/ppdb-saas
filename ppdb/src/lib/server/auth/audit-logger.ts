import { db } from '$lib/server/db';
import { auditLogs } from '$lib/server/db/schema';

export interface AuditLogDetails {
	[key: string]: any;
}

export async function logAuthorizationSuccess(
	actorId: string,
	action: string,
	details?: AuditLogDetails
): Promise<void> {
	await db.insert(auditLogs).values({
		actorId,
		action: `auth_success:${action}`,
		target: action,
		details: details ? JSON.stringify(details) : null
	});
}

export async function logAuthorizationFailure(
	actorId: string,
	action: string,
	reason: string
): Promise<void> {
	await db.insert(auditLogs).values({
		actorId,
		action: `auth_failure:${action}`,
		target: action,
		details: JSON.stringify({ reason })
	});
}

export async function logSensitiveAction(
	actorId: string,
	action: string,
	target: string,
	details: AuditLogDetails
): Promise<void> {
	await db.insert(auditLogs).values({
		actorId,
		action: `sensitive:${action}`,
		target,
		details: JSON.stringify(details)
	});
}
