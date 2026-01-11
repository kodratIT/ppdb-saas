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
