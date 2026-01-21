<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { X, Power, PowerOff, Loader2 } from 'lucide-svelte';
	import { fade, slide } from 'svelte/transition';
	import { i18n } from '$lib/i18n/index.svelte';

	interface Props {
		selectedCount: number;
		title?: string;
		actionLabels?: {
			activate?: string;
			deactivate?: string;
			clear?: string;
		};
		onActivate?: () => void;
		onDeactivate?: () => void;
		onClear?: () => void;
		loading?: boolean;
		position?: 'bottom' | 'sticky';
		showActivate?: boolean;
		showDeactivate?: boolean;
	}

	let {
		selectedCount,
		title = i18n.t('common.all').toLowerCase(),
		actionLabels = {
			activate: i18n.t('actions.activate'),
			deactivate: i18n.t('actions.deactivate'),
			clear: i18n.t('actions.clear')
		},
		onActivate,
		onDeactivate,
		onClear,
		loading = false,
		position = 'bottom',
		showActivate = true,
		showDeactivate = true
	}: Props = $props();

	const containerClasses = $derived(
		position === 'bottom'
			? 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full border bg-background/95 backdrop-blur-sm p-2 px-6 shadow-2xl ring-1 ring-black/5 ring-offset-2'
			: 'sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm p-4 shadow-sm mb-4'
	);
</script>

{#if selectedCount > 0}
	<div
		class={containerClasses}
		transition:slide={{ axis: 'y', duration: 300 }}
		role="toolbar"
		aria-label={i18n.t('common.actions')}
	>
		<div class="flex items-center justify-between gap-8">
			<div class="flex items-center gap-3">
				<div
					class="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
				>
					{selectedCount}
				</div>
				<span class="text-sm font-semibold tracking-tight">
					{selectedCount}
					{i18n.t('common.selected')}
				</span>
			</div>

			<div class="flex items-center gap-2">
				{#if showActivate}
					<Button
						variant="outline"
						size="sm"
						onclick={onActivate}
						disabled={loading}
						class="h-9 rounded-full px-4 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/30"
					>
						{#if loading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{:else}
							<Power class="mr-2 h-4 w-4" />
						{/if}
						{actionLabels.activate}
					</Button>
				{/if}

				{#if showDeactivate}
					<Button
						variant="outline"
						size="sm"
						onclick={onDeactivate}
						disabled={loading}
						class="h-9 rounded-full px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
					>
						{#if loading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{:else}
							<PowerOff class="mr-2 h-4 w-4" />
						{/if}
						{actionLabels.deactivate}
					</Button>
				{/if}

				<div class="mx-2 h-4 w-px bg-border"></div>

				<Button
					variant="ghost"
					size="sm"
					onclick={onClear}
					disabled={loading}
					class="h-9 rounded-full px-4 text-muted-foreground hover:bg-muted hover:text-foreground"
				>
					<X class="mr-2 h-4 w-4" />
					{actionLabels.clear}
				</Button>
			</div>
		</div>
	</div>
{/if}
