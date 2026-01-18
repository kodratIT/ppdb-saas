<script lang="ts">
	import DashboardLayout from '$lib/components/admin/DashboardLayout.svelte';

	let { children } = $props();
</script>

<DashboardLayout>
	{@render children()}
</DashboardLayout>
