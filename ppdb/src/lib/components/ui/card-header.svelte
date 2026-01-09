<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
	}

	let { class: className, ...restProps }: Props = $props();
</script>

<div class={cn('flex flex-col space-y-1.5 p-6', className)} {...restProps}></div>
