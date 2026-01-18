<script lang="ts">
	import DashboardHeader from './DashboardHeader.svelte';
	import DashboardSidebar from './DashboardSidebar.svelte';
	import { History, Zap, Activity } from 'lucide-svelte';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
	<!-- Fixed Sidebar -->
	<DashboardSidebar />

	<!-- Main Layout Area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Fixed Header -->
		<DashboardHeader />

		<!-- Scrollable Content Grid -->
		<main class="flex-1 overflow-y-auto">
			<div class="p-8">
				<div class="mx-auto max-w-6xl">
					{@render children()}
				</div>
			</div>
		</main>
	</div>
</div>
