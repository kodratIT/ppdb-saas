import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: databaseUrl });

async function getOrCreateTenant(client) {
	const slug = 'demo-school';
	const existing = await client.query('select id from tenants where slug = $1', [slug]);
	if (existing.rows.length > 0) {
		return existing.rows[0].id;
	}
	const result = await client.query(
		'insert into tenants (name, slug) values ($1, $2) returning id',
		['Demo School', slug]
	);
	return result.rows[0].id;
}

async function ensureTenantContext(client, tenantId) {
	await client.query('select set_config($1, $2, true)', ['app.current_tenant_id', tenantId]);
}

async function getOrCreateAdminUser(client, tenantId) {
	const email = 'admin@demo-school.test';
	const existing = await client.query(
		'select id from users where email = $1 and tenant_id = $2',
		[email, tenantId]
	);
	if (existing.rows.length > 0) {
		return existing.rows[0].id;
	}
	const result = await client.query(
		"insert into users (email, tenant_id, name, role, status) values ($1, $2, $3, 'school_admin', 'active') returning id",
		[email, tenantId, 'Demo Admin']
	);
	return result.rows[0].id;
}

async function ensureSchoolProfile(client, tenantId) {
	const existing = await client.query('select id from school_profiles where tenant_id = $1', [
		tenantId
	]);
	if (existing.rows.length > 0) {
		return existing.rows[0].id;
	}
	const result = await client.query(
		'insert into school_profiles (tenant_id, name) values ($1, $2) returning id',
		[tenantId, 'Demo School']
	);
	return result.rows[0].id;
}

async function getOrCreateAdmissionPath(client, tenantId) {
	const name = 'Jalur Umum';
	const existing = await client.query(
		'select id from admission_paths where tenant_id = $1 and name = $2',
		[tenantId, name]
	);
	if (existing.rows.length > 0) {
		return existing.rows[0].id;
	}
	const result = await client.query(
		"insert into admission_paths (tenant_id, name, description, quota, status) values ($1, $2, $3, $4, 'open') returning id",
		[tenantId, name, 'Jalur umum demo', 30]
	);
	return result.rows[0].id;
}

async function ensureFeeStructure(client, tenantId, admissionPathId) {
	const name = 'Biaya Pendaftaran';
	const existing = await client.query(
		'select id from fee_structures where tenant_id = $1 and admission_path_id = $2 and name = $3',
		[tenantId, admissionPathId, name]
	);
	if (existing.rows.length > 0) {
		return existing.rows[0].id;
	}
	const result = await client.query(
		"insert into fee_structures (tenant_id, admission_path_id, name, description, amount, currency, payment_timing, status) values ($1, $2, $3, $4, $5, 'IDR', 'registration', 'active') returning id",
		[tenantId, admissionPathId, name, 'Biaya pendaftaran awal', 150000]
	);
	return result.rows[0].id;
}

async function ensureSuperAdminUser(client, tenantId) {
	const phoneNumber = '6281111111111';
	const email = `${phoneNumber}@whatsapp`;
	const firebaseUid = '8ojf85FU9lYoeFLk9AvmIHpXmJF2';

	const existing = await client.query(
		'select id, role, firebase_uid from users where email = $1 and tenant_id = $2',
		[email, tenantId]
	);

	if (existing.rows.length > 0) {
		const user = existing.rows[0];
		if (user.role !== 'super_admin' || user.firebase_uid !== firebaseUid) {
			await client.query('update users set role = $1, firebase_uid = $2 where id = $3', [
				'super_admin',
				firebaseUid,
				user.id
			]);
		}
		return user.id;
	}

	const result = await client.query(
		"insert into users (email, tenant_id, name, role, status, firebase_uid) values ($1, $2, $3, 'super_admin', 'active', $4) returning id",
		[email, tenantId, 'Super Admin', firebaseUid]
	);
	return result.rows[0].id;
}

async function main() {
	const client = await pool.connect();
	try {
		await client.query('begin');

		const tenantId = await getOrCreateTenant(client);
		await ensureTenantContext(client, tenantId);

		const adminUserId = await getOrCreateAdminUser(client, tenantId);
		const superAdminUserId = await ensureSuperAdminUser(client, tenantId);
		const schoolProfileId = await ensureSchoolProfile(client, tenantId);
		const admissionPathId = await getOrCreateAdmissionPath(client, tenantId);
		const feeStructureId = await ensureFeeStructure(client, tenantId, admissionPathId);

		await client.query('commit');

		console.log('Seed complete');
		console.log('Tenant ID:', tenantId);
		console.log('Admin user ID:', adminUserId);
		console.log('Super admin user ID:', superAdminUserId);
		console.log('School profile ID:', schoolProfileId);
		console.log('Admission path ID:', admissionPathId);
		console.log('Fee structure ID:', feeStructureId);
	} catch (err) {
		await client.query('rollback');
		console.error('Seed failed:', err);
		process.exitCode = 1;
	} finally {
		client.release();
		await pool.end();
	}
}

main();
