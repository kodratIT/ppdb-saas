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

describe('Role Badge Variants', () => {
	it('should render super_admin role badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'role', role: 'super_admin', text: 'Super Admin' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-purple-500');
		expect(badge?.className).toContain('text-white');
	});

	it('should render school_admin role badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'role', role: 'school_admin', text: 'School Admin' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-blue-500');
	});

	it('should render verifier role badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'role', role: 'verifier', text: 'Verifier' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-green-500');
	});

	it('should render treasurer role badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'role', role: 'treasurer', text: 'Treasurer' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-orange-500');
	});
});

describe('Priority Badge Variants', () => {
	it('should render low priority badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'priority', priority: 'low', text: 'Low' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-gray-100');
		expect(badge?.className).toContain('text-gray-700');
	});

	it('should render medium priority badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'priority', priority: 'medium', text: 'Medium' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-yellow-100');
	});

	it('should render high priority badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'priority', priority: 'high', text: 'High' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-orange-100');
	});

	it('should render urgent priority badge', () => {
		const { container } = render(BadgeWrapper, {
			props: { variant: 'priority', priority: 'urgent', text: 'Urgent' }
		});
		const badge = container.querySelector('span');
		expect(badge?.className).toContain('bg-red-500');
		expect(badge?.className).toContain('text-white');
	});
});
