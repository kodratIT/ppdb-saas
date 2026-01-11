import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '$lib/server/db';
import { auditLogs } from '$lib/server/db/schema';
import {
	logAuthorizationSuccess,
	logAuthorizationFailure,
	logSensitiveAction
} from '$lib/server/auth/audit-logger';

describe('audit-logger', () => {
	beforeEach(async () => {
		await db.delete(auditLogs);
	});

	describe('logAuthorizationSuccess', () => {
		it('creates audit log record for successful authorization', async () => {
			const actorId = '00000000-0000-0000-0000-000000000123';
			const action = 'login';
			const details = { ip: '192.168.1.1' };

			await logAuthorizationSuccess(actorId, action, details);

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(1);
			expect(logs[0].actorId).toBe(actorId);
			expect(logs[0].action).toBe(`auth_success:${action}`);
			expect(logs[0].target).toBe(action);
			expect(logs[0].details).toBeDefined();
		});

		it('stores details as JSON string', async () => {
			const actorId = '00000000-0000-0000-0000-000000000123';
			const action = 'login';
			const details = { ip: '192.168.1.1', userAgent: 'test-browser' };

			await logAuthorizationSuccess(actorId, action, details);

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(1);
			const parsedDetails = JSON.parse(logs[0].details || '{}');
			expect(parsedDetails.ip).toBe('192.168.1.1');
			expect(parsedDetails.userAgent).toBe('test-browser');
		});

		it('handles missing details parameter', async () => {
			const actorId = '00000000-0000-0000-0000-000000000123';
			const action = 'login';

			await logAuthorizationSuccess(actorId, action);

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(1);
			expect(logs[0].actorId).toBe(actorId);
			expect(logs[0].action).toBe(`auth_success:${action}`);
		});

		it('sets timestamp automatically', async () => {
			const actorId = '00000000-0000-0000-0000-000000000123';
			const action = 'login';
			const beforeDate = new Date(Date.now() - 1000);

			await logAuthorizationSuccess(actorId, action);

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(1);
			const afterDate = new Date();
			expect(logs[0].createdAt).toBeInstanceOf(Date);
			expect(logs[0].createdAt.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
			expect(logs[0].createdAt.getTime()).toBeLessThanOrEqual(afterDate.getTime());
		});
	});

	describe('logAuthorizationFailure', () => {
		it('creates audit log record for failed authorization', async () => {
			const actorId = '00000000-0000-0000-0000-000000000123';
			const action = 'requirePermission';
			const reason = 'User lacks required permissions';

			await logAuthorizationFailure(actorId, action, reason);

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(1);
			expect(logs[0].actorId).toBe(actorId);
			expect(logs[0].action).toBe(`auth_failure:${action}`);
			expect(logs[0].target).toBe(action);
		});

		it('stores reason in details JSON', async () => {
			const actorId = '00000000-0000-0000-0000-000000000123';
			const action = 'requirePermission';
			const reason = 'User role parent lacks permission admission_paths:create';

			await logAuthorizationFailure(actorId, action, reason);

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(1);
			const parsedDetails = JSON.parse(logs[0].details || '{}');
			expect(parsedDetails.reason).toBe(reason);
		});

		it('handles empty reason', async () => {
			const actorId = '00000000-0000-0000-0000-000000000123';
			const action = 'requirePermission';

			await logAuthorizationFailure(actorId, action, '');

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(1);
			expect(logs[0].actorId).toBe(actorId);
			expect(logs[0].action).toBe(`auth_failure:${action}`);
		});
	});

	describe('logSensitiveAction', () => {
		it('creates audit log record for sensitive action', async () => {
			const actorId = '00000000-0000-0000-0000-000000000123';
			const action = 'assign_role';
			const target = 'user-456';
			const details = { oldRole: 'parent', newRole: 'school_admin' };

			await logSensitiveAction(actorId, action, target, details);

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(1);
			expect(logs[0].actorId).toBe(actorId);
			expect(logs[0].action).toBe(`sensitive:${action}`);
			expect(logs[0].target).toBe(target);
		});

		it('stores action details as JSON string', async () => {
			const actorId = '00000000-0000-0000-0000-000000000123';
			const action = 'assign_role';
			const target = 'user-456';
			const details = {
				oldRole: 'parent',
				newRole: 'school_admin',
				changedBy: 'admin@school.edu'
			};

			await logSensitiveAction(actorId, action, target, details);

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(1);
			const parsedDetails = JSON.parse(logs[0].details || '{}');
			expect(parsedDetails.oldRole).toBe('parent');
			expect(parsedDetails.newRole).toBe('school_admin');
			expect(parsedDetails.changedBy).toBe('admin@school.edu');
		});

		it('handles empty details object', async () => {
			const actorId = '00000000-0000-0000-0000-000000000123';
			const action = 'archive_admission_path';
			const target = 'path-789';

			await logSensitiveAction(actorId, action, target, {});

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(1);
			expect(logs[0].actorId).toBe(actorId);
			expect(logs[0].action).toBe(`sensitive:${action}`);
			expect(logs[0].target).toBe(target);
		});

		it('prefixes action with sensitive:', async () => {
			const actorId = '00000000-0000-0000-0000-000000000123';
			const action = 'delete_fee_structure';
			const target = 'fee-001';

			await logSensitiveAction(actorId, action, target, {});

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(1);
			expect(logs[0].action).toBe(`sensitive:${action}`);
		});
	});

	describe('multiple log entries', () => {
		it('creates separate audit log records for different events', async () => {
			await logAuthorizationSuccess('00000000-0000-0000-0000-000000000001', 'login', {
				ip: '1.1.1.1'
			});
			await logAuthorizationFailure(
				'00000000-0000-0000-0000-000000000002',
				'requirePermission',
				'No permission'
			);
			await logSensitiveAction('00000000-0000-0000-0000-000000000003', 'assign_role', 'user-4', {
				newRole: 'admin'
			});

			const logs = await db.select().from(auditLogs);
			expect(logs).toHaveLength(3);

			expect(logs[0].action).toBe('auth_success:login');
			expect(logs[0].actorId).toBe('00000000-0000-0000-0000-000000000001');

			expect(logs[1].action).toBe('auth_failure:requirePermission');
			expect(logs[1].actorId).toBe('00000000-0000-0000-0000-000000000002');

			expect(logs[2].action).toBe('sensitive:assign_role');
			expect(logs[2].actorId).toBe('00000000-0000-0000-0000-000000000003');
		});
	});
});
