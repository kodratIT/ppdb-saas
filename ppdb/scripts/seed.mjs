import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load .env manually
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

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set');

const pool = new Pool({
	connectionString: databaseUrl,
	ssl: databaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function main() {
	const client = await pool.connect();
	try {
		await client.query('begin');

		console.log('--- Reseting Data (Optional, but good for clean seed) ---');
		// Add cleanup if needed, but for now we'll just upsert

		// 1. Central Admin & Super Admin
		console.log('1. Seeding Central Admin...');
		const centralSlug = 'admin';
		let res = await client.query('insert into tenants (name, slug, status) values ($1, $2, $3) on conflict (slug) do update set status = $3 returning id',
			['PPDB-SAAS CENTRAL', centralSlug, 'active']);
		const centralId = res.rows[0].id;

		const superEmail = 'superadmin@ppdb-saas.com';
		const superUid = 'FhUO2LwNiPXf7hFlb2a2uKJdGfy2';
		await client.query(`
			insert into users (email, tenant_id, name, role, status, firebase_uid) 
			values ($1, $2, $3, 'super_admin', 'active', $4)
			on conflict (email, tenant_id) do update set firebase_uid = $4
		`, [superEmail, centralId, 'Super Admin User', superUid]);

		// 2. Multiple Tenants (Active & Inactive)
		console.log('2. Seeding Multiple Schools...');
		const schools = [
			{ name: 'SMA Negeri 1 Jakarta', slug: 'sman1jkt', status: 'active', level: 'SMA' },
			{ name: 'SMPIT Al-Barkah', slug: 'albarkah', status: 'active', level: 'SMP' },
			{ name: 'SD Nusantara', slug: 'nusantara', status: 'inactive', level: 'SD' },
			{ name: 'Universitas Indonesia (Demo)', slug: 'ui-demo', status: 'active', level: 'Universitas' }
		];

		const schoolIds = [];
		for (const s of schools) {
			const r = await client.query(`
				insert into tenants (name, slug, status) 
				values ($1, $2, $3) 
				on conflict (slug) do update set status = $3 
				returning id
			`, [s.name, s.slug, s.status]);
			const tId = r.rows[0].id;
			schoolIds.push({ id: tId, ...s });

			// Profile
			await client.query(`
				insert into school_profiles (tenant_id, name, school_level, address, city, province)
				values ($1, $2, $3, $4, $5, $6)
				on conflict (tenant_id) do update set school_level = $3
			`, [tId, s.name, s.level, 'Jl. Merdeka No. 123', s.slug === 'sman1jkt' ? 'Jakarta Pusat' : 'Bandung', 'Jawa Barat']);

			// Unit
			await client.query(`
				insert into units (tenant_id, name, level, config)
				values ($1, $2, $3, $4)
			`, [tId, s.name + ' Reguler', s.level, JSON.stringify({})]);
		}

		// 3. Admission Paths & Fees for SMAN 1 JKT
		console.log('3. Seeding Paths & Fees for SMAN 1...');
		const sman1 = schoolIds.find(s => s.slug === 'sman1jkt');

		const paths = [
			{ name: 'Jalur Zonasi', quota: 100, status: 'open' },
			{ name: 'Jalur Prestasi', quota: 50, status: 'open' },
			{ name: 'Jalur Afirmasi', quota: 30, status: 'open' }
		];

		for (const p of paths) {
			const pr = await client.query(`
				insert into admission_paths (tenant_id, name, quota, status)
				values ($1, $2, $3, $4)
				returning id
			`, [sman1.id, p.name, p.quota, p.status]);
			const pId = pr.rows[0].id;

			// Registration Fee
			await client.query(`
				insert into fee_structures (tenant_id, admission_path_id, name, amount, payment_timing)
				values ($1, $2, $3, $4, 'registration')
			`, [sman1.id, pId, 'Biaya Pendaftaran ' + p.name, 200000]);
		}

		// 4. Parents & Applications
		console.log('4. Seeding Parents & Applications...');
		const parents = [
			{ name: 'Budi Santoso', email: 'budi@gmail.com' },
			{ name: 'Siti Aminah', email: 'siti@gmail.com' },
			{ name: 'Andi Wijaya', email: 'andi@gmail.com' }
		];

		const pathResult = await client.query('select id from admission_paths where tenant_id = $1 limit 1', [sman1.id]);
		const defaultPathId = pathResult.rows[0].id;

		for (const p of parents) {
			const userRes = await client.query(`
				insert into users (email, tenant_id, name, role, status)
				values ($1, $2, $3, 'parent', 'active')
				on conflict (email, tenant_id) do update set name = $3
				returning id
			`, [p.email, sman1.id, p.name]);
			const pId = userRes.rows[0].id;

			// Application
			const statuses = ['submitted', 'verified', 'accepted'];
			const status = statuses[Math.floor(Math.random() * statuses.length)];

			const appRes = await client.query(`
				insert into applications (tenant_id, user_id, admission_path_id, status, child_full_name, parent_full_name)
				values ($1, $2, $3, $4, $5, $6)
				returning id
			`, [sman1.id, pId, defaultPathId, status, 'Anak ' + p.name, p.name]);
			const appId = appRes.rows[0].id;

			// Invoices (Paid & Unpaid)
			const isPaid = status !== 'submitted';
			const invRes = await client.query(`
				insert into invoices (tenant_id, application_id, external_id, amount, status, invoice_url, expiry_date)
				values ($1, $2, $3, $4, $5, $6, now() + interval '7 days')
				returning id
			`, [sman1.id, appId, 'INV-' + crypto.randomUUID().slice(0, 8), 200000, isPaid ? 'PAID' : 'PENDING', 'https://invoice.demo/' + appId]);

			if (isPaid) {
				await client.query(`
					insert into payment_transactions (tenant_id, invoice_id, external_id, amount, status, paid_at)
					values ($1, $2, $3, $4, 'SUCCESS', now() - interval '1 day')
				`, [sman1.id, invRes.rows[0].id, 'TX-' + crypto.randomUUID().slice(0, 8), 200000]);
			}
		}

		// 5. Custom Fields (Form Builder Test)
		console.log('5. Seeding Custom Fields...');
		const fields = [
			{ label: 'NISN', key: 'nisn', type: 'text', required: true },
			{ label: 'Pekerjaan Ayah', key: 'father_job', type: 'select', required: false },
			{ label: 'Scan KK', key: 'kk_file', type: 'file', required: true }
		];

		for (let i = 0; i < fields.length; i++) {
			const f = fields[i];
			await client.query(`
				insert into custom_fields (tenant_id, admission_path_id, label, key, field_type, required, "order")
				values ($1, $2, $3, $4, $5, $6, $7)
			`, [sman1.id, defaultPathId, f.label, f.key, f.type, f.required, i]);
		}

		console.log('--- Seeding Done Successfully! ---');
		await client.query('commit');

	} catch (e) {
		await client.query('rollback');
		console.error('Error seeding data:', e);
	} finally {
		client.release();
		await pool.end();
	}
}

main();
