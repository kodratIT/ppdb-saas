// @vitest-environment jsdom
import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Badge from '$lib/components/ui/badge.svelte';
import BadgeWrapper from './helpers/BadgeWrapper.svelte';

describe('Badge Component', () => {
	it('should render with default variant', () => {
		const { container } = render(BadgeWrapper, { props: { text: 'Default' } });
		const badge = container.querySelector('span');
		expect(badge).toHaveTextContent('Default');
		expect(badge?.className).toContain('bg-primary');
	});

	it('should render with destructive variant', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'destructive', text: 'Error' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-destructive');
	});
});

describe('Status Badge Variants', () => {
	it('should render active status badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'status', status: 'active', text: 'Active' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-green-100');
		expect(badge?.className).toContain('text-green-800');
	});

	it('should render inactive status badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'status', status: 'inactive', text: 'Inactive' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-red-100');
		expect(badge?.className).toContain('text-red-800');
	});

	it('should render pending status badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'status', status: 'pending', text: 'Pending' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-yellow-100');
		expect(badge?.className).toContain('text-yellow-800');
	});

	it('should render approved status badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'status', status: 'approved', text: 'Approved' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-blue-100');
		expect(badge?.className).toContain('text-blue-800');
	});

	it('should render rejected status badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'status', status: 'rejected', text: 'Rejected' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-gray-100');
		expect(badge?.className).toContain('text-gray-800');
	});
});
