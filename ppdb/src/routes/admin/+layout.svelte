<script lang="ts">
	import AdminLayout from '$lib/components/admin/AdminLayout.svelte';
	import { page } from '$app/state';

	let { children } = $props();
	let breadcrumbs = $derived(page.data?.breadcrumbs);
</script>

<AdminLayout {breadcrumbs}>
	{@render children()}
</AdminLayout>
