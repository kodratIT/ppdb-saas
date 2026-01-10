import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

process.env.DATABASE_URL ??= 'postgresql://ppdb:ppdb@localhost:5433/ppdb_test';

vi.mock('$lib/server/db', async () => {
	const schema = await import('$lib/server/db/schema');
	const { Pool } = pg;
	const pool = new Pool({ connectionString: process.env.DATABASE_URL });
	const db = drizzle(pool, { schema });
	return { db };
});

