import { writable } from 'svelte/store';

const clerkStore = writable(null);

export { clerkStore };

export const initClerk = async (publishableKey) => {
  const { initializeClerkClient } = await import('clerk-sveltekit/client');
  await initializeClerkClient(publishableKey);
  return clerkStore;
};

export const getAuthState = () => {
  let clerkInstance;
  clerkStore.subscribe(value => clerkInstance = value)();
  
  if (!clerkInstance) return { userId: null, sessionId: null, getToken: null };

  return {
    userId: clerkInstance.user?.id || null,
    sessionId: clerkInstance.session?.id || null,
    getToken: () => clerkInstance.session?.getToken()
  };
};

export const isAuthenticated = () => {
  let clerkInstance;
  clerkStore.subscribe(value => clerkInstance = value)();
  return !!clerkInstance?.user;
};

export const getAccessToken = async () => {
  let clerkInstance;
  clerkStore.subscribe(value => clerkInstance = value)();
  return clerkInstance?.session?.getToken();
};

export const signOut = async () => {
  let clerkInstance;
  clerkStore.subscribe(value => clerkInstance = value)();
  if (clerkInstance) {
    await clerkInstance.signOut();
  }
};

export const getUser = () => {
  let clerkInstance;
  clerkStore.subscribe(value => clerkInstance = value)();
  return clerkInstance?.user;
};

export const getEmail = () => {
  let clerkInstance;
  clerkStore.subscribe(value => clerkInstance = value)();
  return clerkInstance?.user?.primaryEmailAddress?.emailAddress;
};

export const getFullName = () => {
  let clerkInstance;
  clerkStore.subscribe(value => clerkInstance = value)();
  return clerkInstance?.user?.fullName;
};
