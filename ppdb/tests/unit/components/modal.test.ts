// @vitest-environment jsdom
import { render } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Modal from '$lib/components/ui/modal.svelte';

describe('Modal Component', () => {
	it('should not render when open is false', () => {
		const { container } = render(Modal, { props: { open: false, title: 'Test Modal' } });
		expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
	});

	it('should render when open is true', () => {
		const { container } = render(Modal, { props: { open: true, title: 'Test Modal' } });
		expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
		expect(container.textContent).toContain('Test Modal');
	});

	it('should apply default variant styles', () => {
		const { container } = render(Modal, {
			props: { open: true, title: 'Default Modal', variant: 'default' }
		});
		const dialog = container.querySelector('[role="dialog"] > div');
		expect(dialog?.className).toContain('border-border');
	});

	it('should apply destructive variant styles', () => {
		const { container } = render(Modal, {
			props: { open: true, title: 'Delete?', variant: 'destructive' }
		});
		const dialog = container.querySelector('[role="dialog"] > div');
		expect(dialog?.className).toContain('border-destructive');
	});

	it('should apply success variant styles', () => {
		const { container } = render(Modal, {
			props: { open: true, title: 'Success!', variant: 'success' }
		});
		const dialog = container.querySelector('[role="dialog"] > div');
		expect(dialog?.className).toContain('border-green-500');
	});

	it('should render action buttons when provided', () => {
		const onConfirm = vi.fn();
		const onCancel = vi.fn();

		const { getByRole } = render(Modal, {
			props: {
				open: true,
				title: 'Confirm Action',
				actions: {
					confirm: { label: 'Confirm', onClick: onConfirm },
					cancel: { label: 'Cancel', onClick: onCancel }
				}
			}
		});

		expect(getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
		expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
	});

	it('should call onClick when action button clicked', async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();

		const { getByRole } = render(Modal, {
			props: {
				open: true,
				title: 'Test',
				actions: {
					confirm: { label: 'OK', onClick: onConfirm }
				}
			}
		});

		await user.click(getByRole('button', { name: 'OK' }));
		expect(onConfirm).toHaveBeenCalledOnce();
	});
});
