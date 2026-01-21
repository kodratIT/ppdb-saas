import { db } from '$lib/server/db';
import { systemConfigs } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';

export type SystemConfigKey = 
	| 'platform_name' 
	| 'support_email' 
	| 'maintenance_mode'
	| 'trial_days'
	| 'grace_period_days'
	| 'audit_retention_days'
	// SMTP Settings
	| 'smtp_host'
	| 'smtp_port'
	| 'smtp_user'
	| 'smtp_pass'
	| 'smtp_secure'
	// Notification Templates
	| 'template_wa_invoice'
	| 'template_wa_payment_success'
	| 'template_email_welcome';

export interface SystemConfig {
	key: SystemConfigKey;
	value: string;
	description?: string;
}

export const defaultConfigs: Record<SystemConfigKey, string> = {
	platform_name: 'PPDB SAAS Central',
	support_email: 'support@ppdb-saas.com',
	maintenance_mode: 'false',
	trial_days: '14',
	grace_period_days: '7',
	audit_retention_days: '90',
	smtp_host: 'smtp.gmail.com',
	smtp_port: '587',
	smtp_user: '',
	smtp_pass: '',
	smtp_secure: 'false',
	// Notification Templates Defaults
	template_wa_invoice: 'Halo {{name}}, tagihan sekolah Anda sebesar {{amount}} telah terbit. Silakan bayar sebelum {{dueDate}}. Terima kasih.',
	template_wa_payment_success: 'Terima kasih {{name}}, pembayaran Anda sebesar {{amount}} telah kami terima. Akun sekolah Anda kini aktif.',
	template_email_welcome: 'Selamat datang di {{platformName}}! Sekolah Anda {{schoolName}} telah berhasil didaftarkan. Silakan login untuk memulai.'
};

/**
 * Get all system configurations, falling back to defaults if not found in DB
 */
export async function getSystemConfigs() {
	const storedConfigs = await db.select().from(systemConfigs);
	
	// Convert array to map for easier lookup
	const configMap = storedConfigs.reduce((acc, curr) => {
		acc[curr.key as SystemConfigKey] = curr.value;
		return acc;
	}, {} as Record<SystemConfigKey, string>);

	// Merge with defaults
	return {
		platform_name: configMap.platform_name || defaultConfigs.platform_name,
		support_email: configMap.support_email || defaultConfigs.support_email,
		maintenance_mode: configMap.maintenance_mode === 'true',
		trial_days: parseInt(configMap.trial_days || defaultConfigs.trial_days),
		grace_period_days: parseInt(configMap.grace_period_days || defaultConfigs.grace_period_days),
		audit_retention_days: parseInt(configMap.audit_retention_days || defaultConfigs.audit_retention_days),
		// SMTP
		smtp_host: configMap.smtp_host || defaultConfigs.smtp_host,
		smtp_port: parseInt(configMap.smtp_port || defaultConfigs.smtp_port),
		smtp_user: configMap.smtp_user || defaultConfigs.smtp_user,
		smtp_pass: configMap.smtp_pass || defaultConfigs.smtp_pass,
		smtp_secure: configMap.smtp_secure === 'true',
		// Templates
		template_wa_invoice: configMap.template_wa_invoice || defaultConfigs.template_wa_invoice,
		template_wa_payment_success: configMap.template_wa_payment_success || defaultConfigs.template_wa_payment_success,
		template_email_welcome: configMap.template_email_welcome || defaultConfigs.template_email_welcome
	};
}

/**
 * Update multiple system configurations at once
 */
export async function updateSystemConfigs(
	configs: Partial<Record<SystemConfigKey, string>>,
	userId: string
) {
	const updates = Object.entries(configs).map(([key, value]) => {
		return db
			.insert(systemConfigs)
			.values({
				key,
				value: String(value),
				updatedBy: userId,
				updatedAt: new Date()
			})
			.onConflictDoUpdate({
				target: systemConfigs.key,
				set: {
					value: String(value),
					updatedBy: userId,
					updatedAt: new Date()
				}
			});
	});

	await Promise.all(updates);
}
