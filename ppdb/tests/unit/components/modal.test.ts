// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Modal from '$lib/components/ui/modal.svelte';

describe('Modal Component', () => {
	it('should not render when open is false', () => {
		render(Modal, { props: { open: false, title: 'Test Modal' } });
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('should render when open is true', () => {
		render(Modal, { props: { open: true, title: 'Test Modal' } });
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('Test Modal')).toBeInTheDocument();
	});
});
