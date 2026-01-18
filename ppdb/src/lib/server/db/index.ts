import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Use postgres-js driver for both local dev and production
// (unless deploying to Cloudflare Workers where neon-serverless is mandatory)
// Since the current error is specifically about "neon-http", switching to
// postgres-js will provide full transaction support in Node.js environments.

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });
