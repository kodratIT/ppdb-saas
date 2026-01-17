<script lang="ts">
	import { cn } from '$lib/utils';
	import Button from './button.svelte';
	import { onMount } from 'svelte';

	interface ActionButton {
		label: string;
		onClick: () => void;
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		disabled?: boolean;
	}

	interface Props {
		open?: boolean;
		title?: string;
		onClose?: () => void;
		variant?: 'default' | 'destructive' | 'success';
		class?: string;
		children?: unknown;
		actions?: {
			confirm?: ActionButton;
			cancel?: ActionButton;
		};
	}

	let {
		open = false,
		title,
		onClose,
		variant = 'default',
		class: className,
		children,
		actions
	}: Props = $props();

	const variantStyles = {
		default: 'border-border',
		destructive: 'border-destructive bg-destructive/5',
		success: 'border-green-500 bg-green-50/50'
	};

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open && onClose) {
			onClose();
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeydown);
			return () => {
				window.removeEventListener('keydown', handleKeydown);
			};
		}
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose?.();
		}}
		role="dialog"
		aria-modal="true"
	>
		<div
			class={cn(
				'relative bg-background border shadow-lg rounded-lg max-w-md w-full mx-4 p-6',
				variantStyles[variant],
				className
			)}
		>
			{#if title}
				<div class="flex items-center justify-between mb-4">
					<h2
						class={cn(
							'text-lg font-semibold',
							variant === 'destructive' && 'text-destructive',
							variant === 'success' && 'text-green-700'
						)}
					>
						{title}
					</h2>
					{#if onClose}
						<button
							onclick={onClose}
							class="text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Close modal"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
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
			{/if}

			<div class="space-y-4">
				{#if children}
					{@render children()}
				{/if}
			</div>

			{#if actions?.confirm || actions?.cancel}
				<div class="flex justify-end gap-2 mt-6 pt-4 border-t">
					{#if actions.cancel}
						<Button
							variant={actions.cancel.variant ?? 'outline'}
							onclick={actions.cancel.onClick}
							disabled={actions.cancel.disabled}
						>
							{actions.cancel.label}
						</Button>
					{/if}
					{#if actions.confirm}
						<Button
							variant={actions.confirm.variant ??
								(variant === 'destructive' ? 'destructive' : 'default')}
							onclick={actions.confirm.onClick}
							disabled={actions.confirm.disabled}
						>
							{actions.confirm.label}
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}
