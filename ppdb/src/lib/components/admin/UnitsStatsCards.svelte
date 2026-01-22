<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { School, GraduationCap, Award, Clock } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';
	import type { Unit, UnitStats } from '$lib/types/admin';

	interface Props {
		units: Unit[];
		isLoading?: boolean;
	}

	let { units = [], isLoading = false }: Props = $props();

	// Calculate stats from units
	const stats = $derived.by((): UnitStats => {
		const byLevel: Record<string, number> = {};
		const byAccreditation: Record<string, number> = {};

		// Calculate 7 days ago for "recently added"
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		let recentlyAdded = 0;

		units.forEach((unit) => {
			// Count by level
			if (unit.level) {
				byLevel[unit.level] = (byLevel[unit.level] || 0) + 1;
			}

			// Count by accreditation
			if (unit.accreditation) {
				byAccreditation[unit.accreditation] = (byAccreditation[unit.accreditation] || 0) + 1;
			}

			// Count recently added
			if (unit.createdAt) {
				const createdDate = new Date(unit.createdAt);
				if (createdDate >= sevenDaysAgo) {
					recentlyAdded++;
				}
			}
		});

		return {
			total: units.length,
			byLevel,
			byAccreditation,
			recentlyAdded
		};
	});

	// Get top level (most common)
	const topLevel = $derived.by(() => {
		const entries = Object.entries(stats.byLevel);
		if (entries.length === 0) return { level: '-', count: 0 };
		const sorted = entries.sort((a, b) => b[1] - a[1]);
		return { level: sorted[0][0], count: sorted[0][1] };
	});

	// Get accreditation A count
	const accreditedACount = $derived(stats.byAccreditation['A'] || 0);
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	<!-- Total Units -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">{i18n.t('admin.units.totalUnits')}</Card.Title>
			<School class="h-4 w-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content>
			{#if isLoading}
				<Skeleton class="h-8 w-16" />
				<Skeleton class="mt-1 h-4 w-24" />
			{:else}
				<div class="text-2xl font-bold">{stats.total}</div>
				<p class="text-xs text-muted-foreground">{i18n.t('admin.units.unitsMatching')}</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Level Distribution -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">{i18n.t('admin.units.levelDistribution')}</Card.Title>
			<GraduationCap class="h-4 w-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content>
			{#if isLoading}
				<Skeleton class="h-8 w-16" />
				<Skeleton class="mt-1 h-4 w-32" />
			{:else}
				<div class="text-2xl font-bold">{Object.keys(stats.byLevel).length}</div>
				<p class="text-xs text-muted-foreground">
					{#if topLevel.count > 0}
						{i18n.t('admin.units.mostCommon')}: {topLevel.level} ({topLevel.count})
					{:else}
						{i18n.t('admin.units.noData')}
					{/if}
				</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Accreditation A -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">{i18n.t('admin.units.accreditedA')}</Card.Title>
			<Award class="h-4 w-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content>
			{#if isLoading}
				<Skeleton class="h-8 w-16" />
				<Skeleton class="mt-1 h-4 w-24" />
			{:else}
				<div class="text-2xl font-bold">{accreditedACount}</div>
				<p class="text-xs text-muted-foreground">
					{#if stats.total > 0}
						{Math.round((accreditedACount / stats.total) * 100)}% {i18n.t('admin.units.ofTotal')}
					{:else}
						{i18n.t('admin.units.noData')}
					{/if}
				</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Recently Added -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
			<Card.Title class="text-sm font-medium">{i18n.t('admin.units.recentlyAdded')}</Card.Title>
			<Clock class="h-4 w-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content>
			{#if isLoading}
				<Skeleton class="h-8 w-16" />
				<Skeleton class="mt-1 h-4 w-28" />
			{:else}
				<div class="text-2xl font-bold">{stats.recentlyAdded}</div>
				<p class="text-xs text-muted-foreground">{i18n.t('admin.units.last7Days')}</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
