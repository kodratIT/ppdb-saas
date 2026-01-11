// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Dialog from '$lib/components/ui/dialog.svelte';

describe('Dialog Component', () => {
	it('should render confirmation dialog', () => {
		render(Dialog, {
			props: {
				open: true,
				title: 'Delete Item?',
				message: 'This action cannot be undone.',
				variant: 'destructive'
			}
		});

		expect(screen.getByText('Delete Item?')).toBeInTheDocument();
		expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
	});

	it('should call onConfirm when confirm clicked', async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn();

		render(Dialog, {
			props: {
				open: true,
				title: 'Confirm',
				message: 'Are you sure?',
				onConfirm,
				confirmLabel: 'Yes, delete'
			}
		});

		await user.click(screen.getByRole('button', { name: 'Yes, delete' }));
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it('should call onCancel when cancel clicked', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();

		render(Dialog, {
			props: {
				open: true,
				title: 'Confirm',
				message: 'Are you sure?',
				onCancel,
				cancelLabel: 'No, keep it'
			}
		});

		await user.click(screen.getByRole('button', { name: 'No, keep it' }));
		expect(onCancel).toHaveBeenCalledOnce();
	});
});
