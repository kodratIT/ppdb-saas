import type { Component } from 'svelte';
import TextField from './fields/TextField.svelte';
import NumberField from './fields/NumberField.svelte';
import SelectField from './fields/SelectField.svelte';
import CheckboxField from './fields/CheckboxField.svelte';
import FileField from './fields/FileField.svelte';
import TextAreaField from './fields/TextAreaField.svelte';

export const fieldRegistry: Record<string, Component<any>> = {
	text: TextField,
	email: TextField,
	tel: TextField,
	number: NumberField,
	select: SelectField,
	checkbox: CheckboxField,
	file: FileField,
	textarea: TextAreaField,
	date: TextField // Fallback to text with type="date"
};

export type FieldType = keyof typeof fieldRegistry;
