<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		icon?: string;
		editable?: boolean;
		onEdit?: () => void;
		children: Snippet;
	}

	let { title, icon, editable = true, onEdit, children }: Props = $props();
</script>

<Card class="overflow-hidden">
	<CardHeader class="pb-3 flex flex-row items-center justify-between bg-muted/30">
		<CardTitle class="text-base flex items-center gap-2">
			{#if icon}
				<span class="text-lg">{icon}</span>
			{/if}
			{title}
		</CardTitle>
		{#if editable && onEdit}
			<Button
				variant="ghost"
				size="sm"
				onclick={onEdit}
				class="h-8 px-2 text-xs hover:bg-background"
			>
				<svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
					/>
				</svg>
				Edit
			</Button>
		{/if}
	</CardHeader>
	<CardContent class="pt-4">
		{@render children()}
	</CardContent>
</Card>
