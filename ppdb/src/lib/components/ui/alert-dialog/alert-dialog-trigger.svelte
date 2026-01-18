<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';
	
	type $$Props = AlertDialogPrimitive.TriggerProps;
	
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<AlertDialogPrimitive.Trigger class={cn(className)} {...$$restProps}>
	<slot />
</AlertDialogPrimitive.Trigger>
