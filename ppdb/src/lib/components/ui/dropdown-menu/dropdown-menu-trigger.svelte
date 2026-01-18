<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className, ...restProps } = $props();
</script>

<DropdownMenuPrimitive.Trigger
	class={cn(
		'flex items-center justify-between rounded-sm px-2 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
		className
	)}
	{...restProps}
/>
