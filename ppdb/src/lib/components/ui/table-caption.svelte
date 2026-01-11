<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableCaptionElement> {}

	let { class: className, ...restProps }: Props = $props();
</script>

<caption class={cn('mt-4 text-sm text-muted-foreground', className)} {...restProps} />
