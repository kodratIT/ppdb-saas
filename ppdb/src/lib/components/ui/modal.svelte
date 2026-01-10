<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		open?: boolean;
		title?: string;
		onClose?: () => void;
		class?: string;
		children?: any;
	}

	let { open = false, title, onClose, class: className, children }: Props = $props();
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
				className
			)}
		>
			{#if title}
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">{title}</h2>
					{#if onClose}
						<button
							onclick={onClose}
							class="text-muted-foreground hover:text-foreground transition-colors"
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
		</div>
	</div>
{/if}
