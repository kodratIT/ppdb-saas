<script lang="ts">
	import { cn } from '$lib/utils';
	import { Check, Minus } from 'lucide-svelte';

	interface Props {
		checked?: boolean;
		indeterminate?: boolean;
		onCheckedChange?: (checked: boolean) => void;
		disabled?: boolean;
		class?: string;
		[key: string]: any;
	}

	let {
		checked = false,
		indeterminate = false,
		onCheckedChange,
		disabled = false,
		class: className,
		...restProps
	}: Props = $props();

	function handleClick() {
		if (disabled) return;
		onCheckedChange?.(!checked);
	}
</script>

<button
	type="button"
	role="checkbox"
	aria-checked={indeterminate ? 'mixed' : checked}
	data-state={indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked'}
	{disabled}
	onclick={handleClick}
	class={cn(
		'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
		'disabled:cursor-not-allowed disabled:opacity-50',
		checked || indeterminate ? 'bg-primary text-primary-foreground' : 'bg-background',
		className
	)}
	{...restProps}
>
	<div class="flex h-full w-full items-center justify-center text-current">
		{#if indeterminate}
			<Minus class="h-3.5 w-3.5" />
		{:else if checked}
			<Check class="h-3.5 w-3.5" />
		{/if}
	</div>
</button>

