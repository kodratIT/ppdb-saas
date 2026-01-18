<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils';

	type $$Props = RadioGroupPrimitive.ItemProps;
	type $$Events = RadioGroupPrimitive.ItemEvents;

	let className: $$Props['class'] = undefined;
	export { className as class };
	export let value: $$Props['value'];
</script>

<RadioGroupPrimitive.Item
	{value}
	class={cn(
		'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
		className
	)}
	{...$$restProps}
	let:checked
	on:click
>
	<div class="flex items-center justify-center">
		<RadioGroupPrimitive.ItemIndicator>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-2.5 w-2.5 fill-current text-current"
			>
				<circle cx="12" cy="12" r="10" />
			</svg>
		</RadioGroupPrimitive.ItemIndicator>
	</div>
	<RadioGroupPrimitive.ItemInput />
</RadioGroupPrimitive.Item>
