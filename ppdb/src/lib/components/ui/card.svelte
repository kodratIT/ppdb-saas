<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
	}

	let { class: className, ...restProps }: Props = $props();
</script>

<div
	class={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
	{...restProps}
></div>
