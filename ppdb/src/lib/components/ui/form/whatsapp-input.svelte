<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import FormField from './form-field.svelte';

	interface Props {
		value: string;
		label?: string;
		error?: string | string[];
		required?: boolean;
		id?: string;
		helpText?: string;
		placeholder?: string;
		countryCode?: string;
		onChange?: (value: string) => void;
	}

	let {
		value = $bindable(''),
		label = 'WhatsApp Number',
		error,
		required = false,
		id = 'whatsapp',
		helpText = 'Include country code (e.g., +62 for Indonesia). This will be used for important notifications.',
		placeholder = '81234567890',
		countryCode = '+62',
		onChange
	}: Props = $props();

	let selectedCountryCode = $state(countryCode);
	let phoneNumber = $state('');

	// Parse initial value
	$effect(() => {
		if (value && !phoneNumber) {
			// Try to extract country code from value
			if (value.startsWith('+62')) {
				selectedCountryCode = '+62';
				phoneNumber = value.slice(3).replace(/^0/, '');
			} else if (value.startsWith('62')) {
				selectedCountryCode = '+62';
				phoneNumber = value.slice(2).replace(/^0/, '');
			} else if (value.startsWith('0')) {
				selectedCountryCode = '+62';
				phoneNumber = value.slice(1);
			} else if (value.startsWith('+')) {
				// Other country code
				const match = value.match(/^(\+\d{1,4})(.*)$/);
				if (match) {
					selectedCountryCode = match[1];
					phoneNumber = match[2];
				}
			} else {
				phoneNumber = value;
			}
		}
	});

	const countryCodes = [
		{ code: '+62', country: 'Indonesia', flag: '🇮🇩' },
		{ code: '+60', country: 'Malaysia', flag: '🇲🇾' },
		{ code: '+65', country: 'Singapore', flag: '🇸🇬' },
		{ code: '+1', country: 'USA', flag: '🇺🇸' },
		{ code: '+44', country: 'UK', flag: '🇬🇧' }
	];

	function handlePhoneChange(e: Event) {
		const target = e.target as HTMLInputElement;
		// Only allow numbers
		phoneNumber = target.value.replace(/[^\d]/g, '');
		updateValue();
	}

	function handleCountryCodeChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedCountryCode = target.value;
		updateValue();
	}

	function updateValue() {
		const fullNumber = selectedCountryCode + phoneNumber;
		value = fullNumber;
		onChange?.(fullNumber);
	}

	// Format for display
	const formattedPreview = $derived(() => {
		if (!phoneNumber) return '';
		// Format Indonesian number
		if (selectedCountryCode === '+62' && phoneNumber.length > 3) {
			const parts = [];
			let remaining = phoneNumber;
			if (remaining.length > 3) {
				parts.push(remaining.slice(0, 3));
				remaining = remaining.slice(3);
			}
			if (remaining.length > 4) {
				parts.push(remaining.slice(0, 4));
				remaining = remaining.slice(4);
			}
			if (remaining) parts.push(remaining);
			return parts.join('-');
		}
		return phoneNumber;
	});
</script>

<FormField {label} {required} {error} {helpText} {id}>
	<div class="flex">
		<!-- Country Code Selector -->
		<select
			class="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			value={selectedCountryCode}
			onchange={handleCountryCodeChange}
		>
			{#each countryCodes as { code, country, flag }}
				<option value={code}>{flag} {code}</option>
			{/each}
		</select>

		<!-- Phone Number Input -->
		<Input
			{id}
			type="tel"
			{placeholder}
			value={phoneNumber}
			oninput={handlePhoneChange}
			class="rounded-l-none {error ? 'border-destructive' : ''}"
		/>
	</div>

	<!-- Preview -->
	{#if phoneNumber}
		<div class="mt-1.5 flex items-center gap-2 text-xs">
			<span class="text-muted-foreground">Full number:</span>
			<span class="font-mono text-foreground">{selectedCountryCode} {formattedPreview()}</span>

			<!-- WhatsApp Link -->
			<a
				href="https://wa.me/{selectedCountryCode.replace('+', '')}{phoneNumber}"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
			>
				<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
					/>
				</svg>
				<span>Test</span>
			</a>
		</div>
	{/if}
</FormField>
