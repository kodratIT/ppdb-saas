<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import Button from '$lib/components/ui/button.svelte';

	interface Props {
		open?: boolean;
		title: string;
		description: string;
		confirmText?: string;
		cancelText?: string;
		variant?: 'default' | 'destructive';
		onConfirm?: () => void;
		onCancel?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		description,
		confirmText = 'Continue',
		cancelText = 'Cancel',
		variant = 'default',
		onConfirm,
		onCancel
	}: Props = $props();

	function handleConfirm() {
		onConfirm?.();
		open = false;
	}

	function handleCancel() {
		onCancel?.();
		open = false;
	}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			<AlertDialog.Description>{description}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={handleCancel}>{cancelText}</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleConfirm} class={variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
				{confirmText}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
