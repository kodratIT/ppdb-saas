<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import {
		FileText,
		Send,
		Clock,
		Archive,
		Eye,
		MousePointerClick,
		TrendingUp
	} from 'lucide-svelte';

	interface Stats {
		total: number;
		published: number;
		draft: number;
		scheduled: number;
		archived: number;
		totalViews: number;
		totalClicks: number;
	}

	interface Props {
		stats?: Stats;
	}

	let {
		stats = {
			total: 0,
			published: 0,
			draft: 0,
			scheduled: 0,
			archived: 0,
			totalViews: 0,
			totalClicks: 0
		}
	} = $props<Props>();

	let clickRate = $derived(
		stats.totalViews > 0 ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(1) : '0'
	);
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<Card.Root class="bg-gradient-to-br from-card to-muted/30 border shadow-sm">
		<Card.Header class="flex flex-row items-center justify-between pb-2">
			<Card.Title class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Total</Card.Title
			>
			<FileText class="h-4 w-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content>
			<div class="text-3xl font-black tabular-nums">{stats.total}</div>
			<p class="text-xs text-muted-foreground mt-1">Announcements</p>
		</Card.Content>
	</Card.Root>

	<Card.Root class="bg-gradient-to-br from-card to-green-500/5 border shadow-sm">
		<Card.Header class="flex flex-row items-center justify-between pb-2">
			<Card.Title class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Published</Card.Title
			>
			<Send class="h-4 w-4 text-green-500" />
		</Card.Header>
		<Card.Content>
			<div class="text-3xl font-black tabular-nums text-green-600">{stats.published}</div>
			<p class="text-xs text-muted-foreground mt-1">Currently live</p>
		</Card.Content>
	</Card.Root>

	<Card.Root class="bg-gradient-to-br from-card to-blue-500/5 border shadow-sm">
		<Card.Header class="flex flex-row items-center justify-between pb-2">
			<Card.Title class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Total Views</Card.Title
			>
			<Eye class="h-4 w-4 text-blue-500" />
		</Card.Header>
		<Card.Content>
			<div class="text-3xl font-black tabular-nums text-blue-600">
				{stats.totalViews.toLocaleString()}
			</div>
			<p class="text-xs text-muted-foreground mt-1">All-time views</p>
		</Card.Content>
	</Card.Root>

	<Card.Root class="bg-gradient-to-br from-card to-purple-500/5 border shadow-sm">
		<Card.Header class="flex flex-row items-center justify-between pb-2">
			<Card.Title class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Click Rate</Card.Title
			>
			<TrendingUp class="h-4 w-4 text-purple-500" />
		</Card.Header>
		<Card.Content>
			<div class="text-3xl font-black tabular-nums text-purple-600">{clickRate}%</div>
			<p class="text-xs text-muted-foreground mt-1">{stats.totalClicks.toLocaleString()} clicks</p>
		</Card.Content>
	</Card.Root>
</div>

<!-- Secondary Stats -->
<div class="grid gap-4 sm:grid-cols-3 mt-4">
	<Card.Root class="border shadow-sm">
		<Card.Header class="flex flex-row items-center justify-between pb-2">
			<Card.Title class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Drafts</Card.Title
			>
			<FileText class="h-4 w-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold tabular-nums">{stats.draft}</div>
			<p class="text-xs text-muted-foreground">Pending review</p>
		</Card.Content>
	</Card.Root>

	<Card.Root class="border shadow-sm">
		<Card.Header class="flex flex-row items-center justify-between pb-2">
			<Card.Title class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Scheduled</Card.Title
			>
			<Clock class="h-4 w-4 text-orange-500" />
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold tabular-nums text-orange-600">{stats.scheduled}</div>
			<p class="text-xs text-muted-foreground">Upcoming</p>
		</Card.Content>
	</Card.Root>

	<Card.Root class="border shadow-sm">
		<Card.Header class="flex flex-row items-center justify-between pb-2">
			<Card.Title class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Archived</Card.Title
			>
			<Archive class="h-4 w-4 text-muted-foreground" />
		</Card.Header>
		<Card.Content>
			<div class="text-2xl font-bold tabular-nums">{stats.archived}</div>
			<p class="text-xs text-muted-foreground">No longer active</p>
		</Card.Content>
	</Card.Root>
</div>
