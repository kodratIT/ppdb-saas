import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = 'postgresql://ppdb_user:ppdb_password@localhost:5435/ppdb_local';

async function run() {
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    console.log('Connected to local DB');

    try {
        const sqlPath = path.join(__dirname, 'drizzle/0011_comprehensive_rls.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying RLS policies...');
        await client.query(sql);
        console.log('RLS policies applied successfully');
    } catch (err) {
        console.error('Error applying RLS policies:', err);
    } finally {
        await client.end();
    }
}

run();
