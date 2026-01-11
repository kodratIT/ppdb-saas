<script lang="ts">
	import Modal from './modal.svelte';

	interface Props {
		open?: boolean;
		title: string;
		message: string;
		variant?: 'default' | 'destructive' | 'success';
		confirmLabel?: string;
		cancelLabel?: string;
		onConfirm?: () => void;
		onCancel?: () => void;
		confirmDisabled?: boolean;
	}

	let {
		open = false,
		title,
		message,
		variant = 'default',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		onConfirm,
		onCancel,
		confirmDisabled = false
	}: Props = $props();

	const actions = {
		confirm: onConfirm
			? {
					label: confirmLabel,
					onClick: onConfirm,
					variant: variant === 'destructive' ? ('destructive' as const) : ('default' as const),
					disabled: confirmDisabled
				}
			: undefined,
		cancel: onCancel
			? {
					label: cancelLabel,
					onClick: onCancel,
					variant: 'outline' as const
				}
			: undefined
	};
</script>

<Modal {open} {title} {variant} onClose={onCancel} {actions}>
	<p class="text-sm text-muted-foreground">{message}</p>
</Modal>
