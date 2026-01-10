// @vitest-environment jsdom
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Textarea from './textarea.svelte';

describe('Textarea', () => {
	it('renders with value and placeholder', () => {
		render(Textarea, {
			props: {
				value: 'Halo sekolah',
				placeholder: 'Masukkan deskripsi'
			}
		});

		const textarea = screen.getByPlaceholderText('Masukkan deskripsi') as HTMLTextAreaElement;
		expect(textarea.value).toBe('Halo sekolah');
	});
});
