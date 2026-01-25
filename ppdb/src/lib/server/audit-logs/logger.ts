import { db } from '$lib/server/db';
import { auditLogs } from '$lib/server/db/schema';
import type { AuditLogEvent, AuditAction, AuditEntityType, AuditSeverity, AuditStatus } from './types';
import { nanoid } from 'nanoid';

/**
 * Log an audit event to the database
 * Call this from anywhere in the app to track system activities
 */
export async function logAuditEvent(data: AuditLogEvent): Promise<void> {
	try {
		await db.insert(auditLogs).values({
			id: nanoid(),
			tenantId: data.tenantId || null,
			userId: data.userId || null,
			action: data.action,
			entityType: data.entityType,
			entityId: data.entityId,
			details: data.details || {},
			ipAddress: data.ipAddress || null,
			userAgent: data.userAgent || null,
			severity: data.severity || 'info',
			status: data.status || 'success',
			indexedAt: new Date()
		});
	} catch (error) {
		// Log errors but don't throw - audit logging shouldn't break the app
		console.error('Failed to log audit event:', error);
	}
}

/**
 * Helper to log successful events
 */
export async function logSuccess(
	action: AuditAction,
	entityType: AuditEntityType,
	entityId: string,
	options?: {
		userId?: string;
		tenantId?: string;
		details?: AuditLogEvent['details'];
		ipAddress?: string;
		userAgent?: string;
	}
) {
	return logAuditEvent({
		action,
		entityType,
		entityId,
		userId: options?.userId,
		tenantId: options?.tenantId,
		details: options?.details,
		severity: 'info',
		status: 'success',
		ipAddress: options?.ipAddress,
		userAgent: options?.userAgent
	});
}

/**
 * Helper to log failed events
 */
export async function logFailure(
	action: AuditAction,
	entityType: AuditEntityType,
	entityId: string,
	error: string,
	options?: {
		userId?: string;
		tenantId?: string;
		details?: AuditLogEvent['details'];
		ipAddress?: string;
		userAgent?: string;
	}
) {
	return logAuditEvent({
		action,
		entityType,
		entityId,
		userId: options?.userId,
		tenantId: options?.tenantId,
		details: {
			...options?.details,
			metadata: { ...options?.details?.metadata, error }
		},
		severity: 'error',
		status: 'failed',
		ipAddress: options?.ipAddress,
		userAgent: options?.userAgent
	});
}

/**
 * Helper to log warning events
 */
export async function logWarning(
	action: AuditAction,
	entityType: AuditEntityType,
	entityId: string,
	message: string,
	options?: {
		userId?: string;
		tenantId?: string;
		details?: AuditLogEvent['details'];
		ipAddress?: string;
		userAgent?: string;
	}
) {
	return logAuditEvent({
		action,
		entityType,
		entityId,
		userId: options?.userId,
		tenantId: options?.tenantId,
		details: {
			...options?.details,
			metadata: { ...options?.details?.metadata, message }
		},
		severity: 'warning',
		status: 'success',
		ipAddress: options?.ipAddress,
		userAgent: options?.userAgent
	});
}
