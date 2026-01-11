import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import DynamicField from '$lib/components/forms/dynamic/DynamicField.svelte';
import { mount } from 'svelte';

describe('DynamicField', () => {
	const mockField = {
		label: 'Full Name',
		key: 'full_name',
		fieldType: 'text' as const,
		required: true,
		placeholder: 'Enter your name',
		helpText: 'Use your legal name',
		step: 1,
		order: 0
	};

	it('renders text field correctly', async () => {
		render(DynamicField, {
			props: {
				field: mockField,
				value: '',
				error: undefined
			}
		});

		expect(screen.getByLabelText(/Full Name/i)).toBeDefined();
		expect(screen.getByPlaceholderText(/Enter your name/i)).toBeDefined();
		expect(screen.getByText(/Use your legal name/i)).toBeDefined();
	});

	it('displays error message when provided', () => {
		const { getAllByText } = render(DynamicField, {
			props: {
				field: mockField,
				value: '',
				error: 'This field is required'
			}
		});

		expect(screen.getByText(/This field is required/i)).toBeDefined();
		const labels = getAllByText(/Full Name/i);
		// labels[0] might be the first render from previous tests if vitest doesn't cleanup properly,
		// but Testing Library should cleanup. Let's check the last one or be specific.
		const errorLabel = labels.find((l) => l.className.includes('text-destructive'));
		expect(errorLabel).toBeDefined();
	});

	it('renders different field types based on registry', () => {
		const numberField = {
			...mockField,
			fieldType: 'number' as const,
			label: 'Age',
			key: 'age' // use different key to avoid interference
		};
		const { getAllByLabelText } = render(DynamicField, {
			props: {
				field: numberField,
				value: undefined,
				error: undefined
			}
		});

		const labels = getAllByLabelText(/Age/i);
		expect(labels[0]).toBeDefined();
		const input = labels[0] as HTMLInputElement;
		expect(input.type).toBe('number');
	});

	it('renders select field with options', () => {
		const selectField = {
			...mockField,
			fieldType: 'select' as const,
			label: 'Gender',
			options: [
				{ label: 'Male', value: 'm', order: 0 },
				{ label: 'Female', value: 'f', order: 1 }
			]
		};
		const { getAllByText, getAllByLabelText } = render(DynamicField, {
			props: {
				field: selectField,
				value: '',
				error: undefined
			}
		});

		expect(getAllByLabelText(/Gender/i)[0]).toBeDefined();
		expect(getAllByText(/Male/i)[0]).toBeDefined();
		expect(getAllByText(/Female/i)[0]).toBeDefined();
	});
});
