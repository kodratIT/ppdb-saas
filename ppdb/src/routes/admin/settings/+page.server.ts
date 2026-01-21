import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getSchoolProfileByTenantId, updateSchoolProfile } from '$lib/server/domain/school-profile';
import { schoolProfileUpdateSchema } from '$lib/schema/school-profile';
import { db } from '$lib/server/db';
import { requireAuth, requireSuperAdmin } from '$lib/server/auth/authorization';
import { getSystemConfigs, updateSystemConfigs, type SystemConfigKey } from '$lib/server/domain/system-config';
import { checkWahaHealth, checkXenditHealth } from '$lib/server/services/health-check';
import { pruneAuditLogs } from '$lib/server/services/audit-pruner';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = requireAuth(locals);
	const { tenantId, session } = auth;
	const role = session.role;

	// If Super Admin, return platform settings data
	if (role === 'super_admin') {
		const configs = await getSystemConfigs();
		
		// Perform health checks (non-blocking for initial load if preferred, 
		// but here we block to show status immediately)
		// Alternatively, we could fetch this client-side or via a separate action to speed up page load.
		// For admin settings, a small delay is acceptable for accurate status.
		const [wahaStatus, xenditStatus] = await Promise.all([
			checkWahaHealth(),
			checkXenditHealth()
		]);

		return {
			role: 'super_admin',
			profile: null,
			configs,
			health: {
				waha: wahaStatus,
				xendit: xenditStatus
			}
		};
	}

	// If School Admin, return school profile data
	const profile = await getSchoolProfileByTenantId(db as any, tenantId);

	return {
		role,
		profile: profile || {
			name: '',
			description: null,
			contactEmail: null,
			contactPhone: null,
			logoUrl: null,
			bannerUrl: null,
			primaryColor: null,
			secondaryColor: null,
			address: null
		}
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const { tenantId } = requireAuth(locals);

		const formData = await request.formData();
		const data = {
			name: formData.get('name'),
			description: formData.get('description') || null,
			contactEmail: formData.get('contactEmail') || null,
			contactPhone: formData.get('contactPhone') || null,
			logoUrl: formData.get('logoUrl') || null,
			bannerUrl: formData.get('bannerUrl') || null,
			primaryColor: formData.get('primaryColor') || null,
			secondaryColor: formData.get('secondaryColor') || null,
			address: formData.get('address') || null
		};

		const validation = schoolProfileUpdateSchema.safeParse(data);

		if (!validation.success) {
			const fieldErrors = validation.error.flatten().fieldErrors;
			return fail(400, {
				error: 'Validation failed',
				errors: fieldErrors as Record<string, string[]>
			});
		}

		try {
			const updatedProfile = await updateSchoolProfile(db as any, tenantId, validation.data);

			return {
				success: true,
				profile: updatedProfile
			};
		} catch (error) {
			console.error('Failed to update school profile:', error);
			return fail(500, { error: 'Failed to update profile' });
		}
	},

	updateSystemConfigs: async ({ request, locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const formData = await request.formData();
		const updates: Partial<Record<SystemConfigKey, string>> = {};

		// Extract all possible keys from formData
		const keys: SystemConfigKey[] = [
			'platform_name',
			'support_email',
			'maintenance_mode',
			'trial_days',
			'grace_period_days',
			'audit_retention_days',
			'smtp_host',
			'smtp_port',
			'smtp_user',
			'smtp_pass',
			'smtp_secure',
			'template_wa_invoice',
			'template_wa_payment_success',
			'template_email_welcome'
		];

		for (const key of keys) {
			if (formData.has(key)) {
				updates[key] = formData.get(key) as string;
			}
		}

		// Handle boolean toggles that might be missing if unchecked
		if (formData.has('maintenance_mode_toggle')) {
			updates['maintenance_mode'] = formData.get('maintenance_mode') === 'on' ? 'true' : 'false';
		}
		if (formData.has('smtp_secure_toggle')) {
			updates['smtp_secure'] = formData.get('smtp_secure') === 'on' ? 'true' : 'false';
		}

		try {
			await updateSystemConfigs(updates, auth.userId);
			return { success: true };
		} catch (error) {
			console.error('Failed to update system configs:', error);
			return fail(500, { error: 'Failed to update system settings' });
		}
	},

	checkHealth: async ({ locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		const [waha, xendit] = await Promise.all([checkWahaHealth(), checkXenditHealth()]);

		return {
			success: true,
			health: { waha, xendit }
		};
	},

	pruneLogs: async ({ locals }) => {
		const auth = requireAuth(locals);
		requireSuperAdmin(auth);

		try {
			const deletedCount = await pruneAuditLogs();
			return {
				success: true,
				message: `Pruning completed. Deleted ${deletedCount} logs.`
			};
		} catch (error) {
			console.error('Failed to prune audit logs:', error);
			return fail(500, { error: 'Failed to prune audit logs' });
		}
	}
};
