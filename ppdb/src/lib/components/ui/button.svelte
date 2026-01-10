<script lang="ts">
	import { type Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
	}

	let {
		class: className,
		variant = 'default',
		size = 'default',
		children,
		onclick,
		type = 'button',
		disabled,
		...restProps
	}: Props = $props();

	const variantClasses = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'text-primary underline-offset-4 hover:underline'
	};

	const sizeClasses = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10'
	};
</script>

<button
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		variantClasses[variant],
		sizeClasses[size],
		className
	)}
	{onclick}
	{type}
	{disabled}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</button>
