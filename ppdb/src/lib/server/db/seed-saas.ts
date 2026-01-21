import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { saasPackages } from './schema';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

// Load .env manually to ensure it works outside SvelteKit
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
	const envConfig = fs.readFileSync(envPath, 'utf-8');
	envConfig.split('\n').forEach((line) => {
		const [key, value] = line.split('=');
		if (key && value) {
			process.env[key.trim()] = value.trim();
		}
	});
}

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(process.env.DATABASE_URL, {
	ssl: process.env.DATABASE_URL?.includes('neon.tech') ? 'require' : false
});
const db = drizzle(client, { schema });

const PACKAGES = [
	{
		name: 'Free',
		slug: 'free',
		description: 'Paket dasar untuk sekolah kecil',
		priceMonthly: 0,
		priceYearly: 0,
		limits: { max_students: 100, max_storage: '1GB' },
		features: ['basic_admission', 'email_notification'],
		isActive: true
	},
	{
		name: 'Basic',
		slug: 'basic',
		description: 'Paket standar untuk sekolah menengah',
		priceMonthly: 500000,
		priceYearly: 5000000,
		limits: { max_students: 500, max_storage: '5GB' },
		features: ['basic_admission', 'email_notification', 'whatsapp_integration', 'export_data'],
		isActive: true
	},
	{
		name: 'Pro',
		slug: 'pro',
		description: 'Paket lengkap untuk sekolah besar',
		priceMonthly: 1500000,
		priceYearly: 15000000,
		limits: { max_students: -1, max_storage: '20GB' }, // -1 for unlimited
		features: [
			'basic_admission',
			'email_notification',
			'whatsapp_integration',
			'export_data',
			'custom_branding',
			'priority_support'
		],
		isActive: true
	}
];

async function main() {
	console.log('Seeding SaaS packages...');

	for (const pkg of PACKAGES) {
		await db
			.insert(saasPackages)
			.values(pkg)
			.onConflictDoUpdate({
				target: saasPackages.slug,
				set: pkg
			});
		console.log(`Upserted package: ${pkg.name}`);
	}

	console.log('Done!');
	process.exit(0);
}

main().catch((err) => {
	console.error('Seeding failed:', err);
	process.exit(1);
});
