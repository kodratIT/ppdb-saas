<script lang="ts">
	import { Search } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';

	interface Props {
		placeholder?: string;
		value?: string;
		onchange?: (value: string) => void;
		delay?: number;
		class?: string;
	}

	let {
		placeholder = 'Search...',
		value = $bindable(''),
		onchange,
		delay = 300,
		class: className
	}: Props = $props();

	let timer: ReturnType<typeof setTimeout>;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;

		if (delay > 0) {
			clearTimeout(timer);
			timer = setTimeout(() => {
				if (onchange) onchange(value);
			}, delay);
		} else {
			if (onchange) onchange(value);
		}
	}
</script>

<div class={cn('relative w-full group', className)}>
	<Search
		class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300"
	/>
	<Input
		type="search"
		{placeholder}
		{value}
		oninput={handleInput}
		class="pl-11 pr-4 py-2 h-10 rounded-xl bg-slate-100/50 border-slate-200 focus-visible:ring-blue-500/10 focus-visible:border-blue-500/30 transition-all duration-300"
	/>
</div>
