<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { goto } from '$app/navigation';
  import { clerkStore } from '$lib/auth';

  interface Props {
    children: Snippet;
    redirectTo?: string;
  }

  let { children, redirectTo = '/sign-in' }: Props = $props();

  let isLoading = $state(true);
  let isAuthenticated = $state(false);
  let isError = $state(false);

  onMount(() => {
    try {
      let clerkInstance: any;
      clerkStore.subscribe(value => clerkInstance = value)();
      
      isAuthenticated = !!clerkInstance?.user;
      isLoading = false;

      if (!isAuthenticated) {
        const currentPath = window.location.pathname + window.location.search;
        const returnUrl = encodeURIComponent(currentPath);
        goto(`${redirectTo}?redirect_url=${returnUrl}`);
      }
    } catch (error) {
      console.error('Protected route auth check error:', error);
      isError = true;
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <div class="flex items-center justify-center p-8">
    <div class="h-8 w-8 animate-spin rounded-full border-3 border-primary border-t-transparent"></div>
  </div>
{:else if isError}
  <div class="flex items-center justify-center p-8">
    <p class="text-sm text-destructive">Error checking authentication status</p>
  </div>
{:else if isAuthenticated}
  {@render children()}
{/if}
