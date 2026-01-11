<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	type Status = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
	type Role = 'super_admin' | 'school_admin' | 'verifier' | 'treasurer';
	type Priority = 'low' | 'medium' | 'high' | 'urgent';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'status' | 'role' | 'priority';
		status?: Status;
		role?: Role;
		priority?: Priority;
		children?: Snippet;
	}

	let {
		class: className,
		variant = 'default',
		status,
		role,
		priority,
		children,
		...restProps
	}: Props = $props();

	const variantClasses = {
		default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
		secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
		destructive:
			'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
		outline: 'text-foreground'
	};

	const statusClasses: Record<Status, string> = {
		active: 'bg-green-100 text-green-800 border-green-200',
		inactive: 'bg-red-100 text-red-800 border-red-200',
		pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
		approved: 'bg-blue-100 text-blue-800 border-blue-200',
		rejected: 'bg-gray-100 text-gray-800 border-gray-200'
	};

	const roleClasses: Record<Role, string> = {
		super_admin: 'bg-purple-500 text-white border-purple-600',
		school_admin: 'bg-blue-500 text-white border-blue-600',
		verifier: 'bg-green-500 text-white border-green-600',
		treasurer: 'bg-orange-500 text-white border-orange-600'
	};

	const priorityClasses: Record<Priority, string> = {
		low: 'bg-gray-100 text-gray-700 border-gray-200',
		medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
		high: 'bg-orange-100 text-orange-800 border-orange-200',
		urgent: 'bg-red-500 text-white border-red-600'
	};

	function getBadgeClasses() {
		if (variant === 'status' && status) {
			return statusClasses[status];
		}
		if (variant === 'role' && role) {
			return roleClasses[role];
		}
		if (variant === 'priority' && priority) {
			return priorityClasses[priority];
		}
		return variantClasses[variant as keyof typeof variantClasses] || variantClasses.default;
	}
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		getBadgeClasses(),
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</span>
