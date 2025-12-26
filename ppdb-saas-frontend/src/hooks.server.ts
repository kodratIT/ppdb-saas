import { handleClerk } from 'clerk-sveltekit/server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = handleClerk();
