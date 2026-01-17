import { describe, it, expect } from 'vitest';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

describe('test db bootstrap', () => {
	it('connects to test database', async () => {
		const result = await db.execute(sql`select 1 as ok`);
		expect(result.rows[0].ok).toBe(1);
	});
});
