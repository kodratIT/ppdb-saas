import { db } from './src/lib/server/db/index.ts';
import { sql } from 'drizzle-orm';

async function check() {
    try {
        const result = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name LIKE 'saas_%'
        `);
        console.log('Tables found:', result);
    } catch (e) {
        console.error('Error checking tables:', e);
    }
    process.exit(0);
}

check();
