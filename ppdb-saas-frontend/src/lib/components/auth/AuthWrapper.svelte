<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { goto } from '$app/navigation';
  import { initClerk, clerkStore } from '$lib/auth';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let isLoading = $state(true);
  let isError = $state(false);
  let errorMessage = $state('');

  onMount(async () => {
    try {
      const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

      if (!publishableKey) {
        throw new Error('PUBLIC_CLERK_PUBLISHABLE_KEY is not configured');
      }

      await initClerk(publishableKey);
      
      let clerkInstance: any;
      clerkStore.subscribe(value => clerkInstance = value)();
      
      const currentPath = window.location.pathname;
      const isPublicRoute = ['/', '/login', '/signup', '/sign-in', '/sign-up'].includes(currentPath);
      
      if (isPublicRoute) {
        isLoading = false;
        return;
      }
      
      if (clerkInstance?.user) {
        isLoading = false;
      } else {
        const returnUrl = encodeURIComponent(currentPath);
        goto(`/sign-in?redirect_url=${returnUrl}`);
      }
    } catch (error) {
      isError = true;
      errorMessage = error instanceof Error ? error.message : 'Authentication initialization failed';
      console.error('Auth initialization error:', error);
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <div class="fixed inset-0 flex items-center justify-center bg-background">
    <div class="flex flex-col items-center gap-4">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p class="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
{:else if isError}
  <div class="fixed inset-0 flex items-center justify-center bg-background">
    <div class="max-w-md rounded-lg border bg-card p-6 shadow-sm">
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 class="text-lg font-semibold">Authentication Error</h2>
      </div>
      <p class="mb-4 text-sm text-muted-foreground">{errorMessage}</p>
      <button
        class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        onclick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  </div>
{:else}
  {@render children()}
{/if}
