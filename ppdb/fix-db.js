import pkg from 'pg';
const { Client } = pkg;

const databaseUrl =
	'postgresql://neondb_owner:npg_L3yUQIzC9eBt@ep-delicate-thunder-ahgi9kji-pooler.c-3.us-east-1.aws.neon.tech/ppdb?sslmode=require&channel_binding=require';

async function run() {
	const client = new Client({ connectionString: databaseUrl });
	await client.connect();
	console.log('Connected to DB');

	try {
		// 1. Sync school_profiles
		console.log('Syncing school_profiles columns...');
		await client.query(`
			ALTER TABLE school_profiles 
			ADD COLUMN IF NOT EXISTS bank_name text,
			ADD COLUMN IF NOT EXISTS bank_account_name text,
			ADD COLUMN IF NOT EXISTS bank_account_number text,
			ADD COLUMN IF NOT EXISTS landing_page_config jsonb;
		`);

		// 2. Sync applications
		console.log('Syncing applications columns...');
		await client.query(`
			ALTER TABLE applications 
			ADD COLUMN IF NOT EXISTS distance_m integer,
			ADD COLUMN IF NOT EXISTS parent_email text,
			ADD COLUMN IF NOT EXISTS address text,
			ADD COLUMN IF NOT EXISTS city text,
			ADD COLUMN IF NOT EXISTS province text,
			ADD COLUMN IF NOT EXISTS postal_code text;
		`);

		// 3. Sync payment_transactions
		console.log('Syncing payment_transactions columns...');
		await client.query(`
			ALTER TABLE payment_transactions 
			ADD COLUMN IF NOT EXISTS tenant_id uuid;
		`);

		// 4. Ensure the 'admin' tenant exists
		console.log('Ensuring admin tenant...');
		let tenantId;
		const tenantRes = await client.query("SELECT id FROM tenants WHERE slug = 'admin'");
		if (tenantRes.rows.length === 0) {
			const insertRes = await client.query(
				"INSERT INTO tenants (name, slug, status) VALUES ('PPDB-SAAS CENTRAL', 'admin', 'active') RETURNING id"
			);
			tenantId = insertRes.rows[0].id;
		} else {
			tenantId = tenantRes.rows[0].id;
		}

		// 5. Force Super Admin role for the specific Firebase UID
		const firebaseUid = '8ojf85FU9lYoeFLk9AvmIHpXmJF2';
		console.log(`Setting super_admin role for UID: ${firebaseUid}...`);

		const userRes = await client.query('SELECT id FROM users WHERE firebase_uid = $1', [
			firebaseUid
		]);
		if (userRes.rows.length > 0) {
			await client.query(
				"UPDATE users SET role = 'super_admin', tenant_id = $1, status = 'active' WHERE firebase_uid = $2",
				[tenantId, firebaseUid]
			);
			console.log('User role updated to super_admin in admin tenant');
		} else {
			await client.query(
				'INSERT INTO users (email, name, role, tenant_id, status, firebase_uid) VALUES ($1, $2, $3, $4, $5, $6)',
				['admin@ppdb-saas.test', 'Super Admin', 'super_admin', tenantId, 'active', firebaseUid]
			);
			console.log('Super Admin user created');
		}

		console.log('All Fixes Applied Successfully');
	} catch (err) {
		console.error('Error during execution:', err);
	} finally {
		await client.end();
	}
}

run();
