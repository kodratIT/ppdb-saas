import pkg from 'pg';
const { Client } = pkg;

const databaseUrl = 'postgresql://ppdb_user:ppdb_password@localhost:5435/ppdb_local';

async function run() {
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    console.log('Connected to local DB');

    try {
        console.log('Creating payout_status enum and payouts table...');
        await client.query(`
			DO $$ BEGIN
				CREATE TYPE payout_status AS ENUM('pending', 'processed', 'completed', 'failed', 'rejected');
			EXCEPTION
				WHEN duplicate_object THEN null;
			END $$;

			CREATE TABLE IF NOT EXISTS payouts (
				id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
				tenant_id uuid NOT NULL REFERENCES tenants(id),
				amount integer NOT NULL,
				status payout_status DEFAULT 'pending' NOT NULL,
				bank_name text NOT NULL,
				account_number text NOT NULL,
				account_name text NOT NULL,
				reference text,
				requested_by uuid NOT NULL REFERENCES users(id),
				processed_by uuid REFERENCES users(id),
				processed_at timestamp,
				created_at timestamp DEFAULT now() NOT NULL,
				updated_at timestamp DEFAULT now() NOT NULL
			);
		`);

        console.log('Applying RLS to payouts...');
        await client.query(`
			ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
			DROP POLICY IF EXISTS payouts_tenant_isolation ON payouts;
			CREATE POLICY payouts_tenant_isolation ON payouts
				USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
			
			DROP POLICY IF EXISTS payouts_insert_policy ON payouts;
			CREATE POLICY payouts_insert_policy ON payouts FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
			
			DROP POLICY IF EXISTS payouts_update_policy ON payouts;
			CREATE POLICY payouts_update_policy ON payouts FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
			
			DROP POLICY IF EXISTS payouts_delete_policy ON payouts;
			CREATE POLICY payouts_delete_policy ON payouts FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::uuid);
		`);

        // Re-apply global RLS to prevent drizzle-kit push from thinking they are gone if we run it again
        // But for now, just ensure they are there.

        console.log('Payouts setup completed successfully');
    } catch (err) {
        console.error('Error during setup:', err);
    } finally {
        await client.end();
    }
}

run();
