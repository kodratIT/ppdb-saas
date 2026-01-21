<script lang="ts">
	import type { Snippet } from 'svelte';
	import DashboardHeader from './DashboardHeader.svelte';
	import DashboardSidebar from './DashboardSidebar.svelte';
	import { cn } from '$lib/utils';

	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	interface Props {
		children: Snippet;
		breadcrumbs?: BreadcrumbItem[];
		class?: string;
	}

	let { children, breadcrumbs, class: className }: Props = $props();
</script>

<div class="flex h-screen w-full overflow-hidden bg-background">
	<!-- Sidebar -->
	<DashboardSidebar />

	<!-- Main Content Area -->
	<div class="flex flex-1 flex-col overflow-hidden relative">
		<!-- Aesthetic background blur/gradient -->
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.03),transparent)] pointer-events-none"
		></div>

		<!-- Header -->
		<DashboardHeader {breadcrumbs} />

		<!-- Main Content -->
		<main class="flex-1 overflow-y-auto relative scroll-smooth dashboard-relief">
			<div class={cn('container mx-auto p-4 md:p-8 animate-in-fade', className)}>
				<div class="mx-auto max-w-[1400px]">
					{@render children()}
				</div>
			</div>
		</main>
	</div>
</div>
