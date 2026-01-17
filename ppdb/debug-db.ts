
import { db } from './src/lib/server/db';
import { users } from './src/lib/server/db/schema';
import { count } from 'drizzle-orm';

async function main() {
  try {
    console.log('Checking DB connection...');
    const result = await db.select({ count: count() }).from(users);
    console.log('DB connection successful. User count:', result[0].count);
  } catch (error) {
    console.error('DB connection failed:', error);
  }
  process.exit(0);
}

main();
