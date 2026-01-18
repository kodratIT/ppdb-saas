<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from 'bits-ui';
	
	type $$Props = AlertDialogPrimitive.Props;
	
	export let open: $$Props['open'] = undefined;
</script>

<AlertDialogPrimitive.Root bind:open {...$$restProps}>
	<slot />
</AlertDialogPrimitive.Root>
