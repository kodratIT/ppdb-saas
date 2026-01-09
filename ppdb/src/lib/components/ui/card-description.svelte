<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
	}

	let { class: className, ...restProps }: Props = $props();
</script>

<p class={cn('text-sm text-muted-foreground', className)} {...restProps}></p>
