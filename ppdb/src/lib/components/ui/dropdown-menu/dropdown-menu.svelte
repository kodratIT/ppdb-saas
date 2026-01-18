<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	let { class: className, ...restProps } = $props();
</script>

<DropdownMenuPrimitive.Root { ...restProps } >
    {@render restProps.children?.()}
</DropdownMenuPrimitive.Root>
