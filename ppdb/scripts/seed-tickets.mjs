import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString: databaseUrl });

async function main() {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');

		// 1. Get Tenants
		const demoTenantRes = await client.query("SELECT id FROM tenants WHERE slug = 'demo-school'");
		const demoTenantId = demoTenantRes.rows[0]?.id;

		const centralTenantRes = await client.query("SELECT id FROM tenants WHERE slug = 'admin'");
		const centralTenantId = centralTenantRes.rows[0]?.id;

		if (!demoTenantId || !centralTenantId) {
			throw new Error('Tenants not found. Run npm run db:seed first.');
		}

		// 2. Get Users
		const schoolAdminRes = await client.query(
			"SELECT id FROM users WHERE tenant_id = $1 AND role = 'school_admin' LIMIT 1",
			[demoTenantId]
		);
		const schoolAdminId = schoolAdminRes.rows[0]?.id;

		const superAdminRes = await client.query(
			"SELECT id FROM users WHERE tenant_id = $1 AND role = 'super_admin' LIMIT 1",
			[centralTenantId]
		);
		const superAdminId = superAdminRes.rows[0]?.id;

		if (!schoolAdminId || !superAdminId) {
			throw new Error('Users not found. Run npm run db:seed first.');
		}

		console.log('Seeding tickets...');

		// Ticket 1: High Priority, Open
		const t1 = await client.query(
			`INSERT INTO tickets (tenant_id, user_id, subject, priority, status, created_at, updated_at)
             VALUES ($1, $2, 'CRITICAL: Payment Gateway Error', 'high', 'open', NOW() - INTERVAL '1 hour', NOW())
             RETURNING id`,
			[demoTenantId, schoolAdminId]
		);
		await client.query(
			`INSERT INTO ticket_messages (ticket_id, sender_id, content, created_at)
             VALUES ($1, $2, 'Halo admin, kami mengalami masalah saat mencoba mengaktifkan Xendit. Muncul error "Invalid Secret Key". Mohon bantuannya segera karena PPDB sudah buka.', NOW() - INTERVAL '1 hour')`,
			[t1.rows[0].id, schoolAdminId]
		);

		// Ticket 2: Medium Priority, In Progress
		const t2 = await client.query(
			`INSERT INTO tickets (tenant_id, user_id, subject, priority, status, created_at, updated_at)
             VALUES ($1, $2, 'Tanya fitur WhatsApp', 'medium', 'in_progress', NOW() - INTERVAL '1 day', NOW())
             RETURNING id`,
			[demoTenantId, schoolAdminId]
		);
		await client.query(
			`INSERT INTO ticket_messages (ticket_id, sender_id, content, created_at)
             VALUES ($1, $2, 'Apakah fitur broadcast WA bisa untuk nomor luar negeri?', NOW() - INTERVAL '1 day')`,
			[t2.rows[0].id, schoolAdminId]
		);
		await client.query(
			`INSERT INTO ticket_messages (ticket_id, sender_id, content, created_at)
             VALUES ($1, $2, 'Halo, saat ini kami mendukung semua nomor yang terdaftar di WhatsApp. Apakah ada kendala spesifik?', NOW() - INTERVAL '20 hours')`,
			[t2.rows[0].id, superAdminId]
		);
		await client.query(
			`INSERT INTO ticket_messages (ticket_id, sender_id, content, created_at)
             VALUES ($1, $2, 'Baik, saya akan coba dulu dengan nomor Malaysia (+60).', NOW() - INTERVAL '2 hours')`,
			[t2.rows[0].id, schoolAdminId]
		);

		// Ticket 3: Low Priority, Resolved
		const t3 = await client.query(
			`INSERT INTO tickets (tenant_id, user_id, subject, priority, status, created_at, updated_at)
             VALUES ($1, $2, 'Cara ganti logo', 'low', 'resolved', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
             RETURNING id`,
			[demoTenantId, schoolAdminId]
		);
		await client.query(
			`INSERT INTO ticket_messages (ticket_id, sender_id, content, created_at)
             VALUES ($1, $2, 'Menu ganti logo dimana ya?', NOW() - INTERVAL '3 days')`,
			[t3.rows[0].id, schoolAdminId]
		);
		await client.query(
			`INSERT INTO ticket_messages (ticket_id, sender_id, content, created_at)
             VALUES ($1, $2, 'Halo, ada di menu Settings > School Profile. Silakan upload file PNG/JPG disana.', NOW() - INTERVAL '2 days')`,
			[t3.rows[0].id, superAdminId]
		);

		await client.query('COMMIT');
		console.log('Tickets seeded successfully!');
	} catch (err) {
		await client.query('ROLLBACK');
		console.error('Seed failed:', err);
		process.exit(1);
	} finally {
		client.release();
		await pool.end();
	}
}

main();
