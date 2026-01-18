<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	type $$Props = RadioGroupPrimitive.Props;
	type $$Events = RadioGroupPrimitive.Events;

	let className: $$Props['class'] = undefined;
	export { className as class };
	export let value: $$Props['value'] = undefined;
	export let onValueChange: $$Props['onValueChange'] = undefined;
</script>

<RadioGroupPrimitive.Root
	bind:value
	{onValueChange}
	class={cn('grid gap-2', className)}
	{...$$restProps}
	on:keydown
>
	<slot />
</RadioGroupPrimitive.Root>
