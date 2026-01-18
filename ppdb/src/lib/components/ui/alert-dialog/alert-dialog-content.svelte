<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	import { fly, fade } from 'svelte/transition';
	
	type $$Props = AlertDialogPrimitive.ContentProps;
	
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<AlertDialogPrimitive.Portal>
	<AlertDialogPrimitive.Overlay
		transition={fade}
		transitionConfig={{ duration: 150 }}
		class="fixed inset-0 z-50 bg-black/80"
	/>
	<AlertDialogPrimitive.Content
		transition={fly}
		transitionConfig={{ y: -10, duration: 150 }}
		class={cn(
			'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
			className
		)}
		{...$$restProps}
	>
		<slot />
	</AlertDialogPrimitive.Content>
</AlertDialogPrimitive.Portal>
