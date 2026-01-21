import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

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

async function main() {
	const sql = postgres(process.env.DATABASE_URL!, {
		ssl: process.env.DATABASE_URL?.includes('neon.tech') ? 'require' : false
	});

	console.log('Checking tables...');
	const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `;

	console.log('Tables found:', tables.map((t) => t.table_name).sort());

	console.log('\nChecking types...');
	const types = await sql`
        SELECT typname 
        FROM pg_type 
        JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace 
        WHERE nspname = 'public'
    `;
	console.log('Types found:', types.map((t) => t.typname).sort());

	await sql.end();
}

main();
