<script lang="ts">
	import Button from '$lib/components/ui/button.svelte';
	import { X, Power, PowerOff } from 'lucide-svelte';

	interface Props {
		selectedCount: number;
		onActivate?: () => void;
		onDeactivate?: () => void;
		onClear?: () => void;
		loading?: boolean;
	}

	let {
		selectedCount,
		onActivate,
		onDeactivate,
		onClear,
		loading = false
	}: Props = $props();
</script>

{#if selectedCount > 0}
	<div
		class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg md:sticky md:bottom-auto md:top-0"
	>
		<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium">
					{selectedCount} {selectedCount === 1 ? 'school' : 'schools'} selected
				</span>
			</div>
			<div class="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onclick={onActivate}
					disabled={loading}
					class="text-green-600 hover:text-green-700"
				>
					<Power class="mr-2 h-4 w-4" />
					Activate
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={onDeactivate}
					disabled={loading}
					class="text-destructive hover:text-destructive"
				>
					<PowerOff class="mr-2 h-4 w-4" />
					Deactivate
				</Button>
				<Button
					variant="ghost"
					size="sm"
					onclick={onClear}
					disabled={loading}
				>
					<X class="mr-2 h-4 w-4" />
					Clear
				</Button>
			</div>
		</div>
	</div>
{/if}
