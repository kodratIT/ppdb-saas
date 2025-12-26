import { initializeClerkClient } from 'clerk-sveltekit/client';

initializeClerkClient(import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY);
