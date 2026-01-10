// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import FormError from './form-error.svelte';

describe('FormError', () => {
	it('renders the first error for a field', () => {
		render(FormError, {
			props: {
				errors: { name: ['Nama wajib diisi'] },
				field: 'name'
			}
		});

		expect(screen.getByText('Nama wajib diisi')).toBeTruthy();
	});

	it('renders nothing when no error exists', () => {
		const { container } = render(FormError, {
			props: {
				errors: {},
				field: 'name'
			}
		});

		expect(container.querySelector('p')).toBeNull();
	});
});
