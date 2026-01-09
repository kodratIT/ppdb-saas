<script lang="ts">
	import { cn } from '$lib/utils';

	type Variant = 'default' | 'success' | 'warning' | 'error' | 'info';

	interface Props {
		variant?: Variant;
		title?: string;
		message?: string;
		class?: string;
		dismissible?: boolean;
		onDismiss?: () => void;
	}

	let {
		variant = 'default',
		title,
		message,
		class: className,
		dismissible = false,
		onDismiss
	}: Props = $props();

	const variantStyles = {
		default: 'bg-background border-border text-foreground',
		success:
			'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
		warning:
			'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
		error:
			'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
		info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
	};

	const iconMap = {
		default: null,
		success: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
				<polyline points="22 4 12 14.01 9 11.01" />
			</svg>
		),
		warning: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
		),
		error: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="15" y1="9" x2="9" y2="15" />
				<line x1="9" y1="9" x2="15" y2="15" />
			</svg>
		),
		info: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="16" x2="12" y2="12" />
				<line x1="12" y1="8" x2="12.01" y2="8" />
			</svg>
		)
	};
</script>

<div
	class={cn('flex gap-3 px-4 py-3 rounded-lg border', variantStyles[variant], className)}
	role="alert"
>
	{#if iconMap[variant]}
		<span class="flex-shrink-0 mt-0.5">{iconMap[variant]}</span>
	{/if}

	<div class="flex-1">
		{#if title}
			<h4 class="font-semibold mb-1">{title}</h4>
		{/if}
		{#if message}
			<p class="text-sm leading-relaxed">{message}</p>
		{/if}
	</div>

	{#if dismissible}
		<button
			onclick={onDismiss}
			class="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
			aria-label="Dismiss"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
	{/if}
</div>
