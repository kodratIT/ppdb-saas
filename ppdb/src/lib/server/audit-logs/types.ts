import type { auditActionEnum, auditEntityTypeEnum, auditSeverityEnum, auditStatusEnum } from '$lib/server/db/schema';

export type AuditAction = (typeof auditActionEnum.enumValues)[number];
export type AuditEntityType = (typeof auditEntityTypeEnum.enumValues)[number];
export type AuditSeverity = (typeof auditSeverityEnum.enumValues)[number];
export type AuditStatus = (typeof auditStatusEnum.enumValues)[number];

export interface AuditLogEvent {
	action: AuditAction;
	entityType: AuditEntityType;
	entityId: string;
	userId?: string;
	tenantId?: string;
	details?: {
		before?: Record<string, any>;
		after?: Record<string, any>;
		metadata?: Record<string, any>;
	};
	severity?: AuditSeverity;
	status?: AuditStatus;
	ipAddress?: string;
	userAgent?: string;
}

export interface AuditLogFilters {
	search?: string;
	action?: AuditAction;
	entityType?: AuditEntityType;
	severity?: AuditSeverity;
	status?: AuditStatus;
	userId?: string;
	tenantId?: string;
	dateFrom?: Date;
	dateTo?: Date;
	page?: number;
	limit?: number;
}
