<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import FormField from './form-field.svelte';

	interface Props {
		address: string;
		postalCode: string;
		errorAddress?: string | string[];
		errorPostalCode?: string | string[];
		addressLabel?: string;
		postalCodeLabel?: string;
		addressPlaceholder?: string;
		postalCodePlaceholder?: string;
		inline?: boolean;
		required?: boolean;
		onChange?: (data: { address: string; postalCode: string }) => void;
	}

	let {
		address = $bindable(''),
		postalCode = $bindable(''),
		errorAddress,
		errorPostalCode,
		addressLabel = 'Street Address',
		postalCodeLabel = 'Postal Code',
		addressPlaceholder = 'e.g., Jl. Merdeka No. 123',
		postalCodePlaceholder = 'e.g., 12345',
		inline = false,
		required = true,
		onChange
	}: Props = $props();

	function handleAddressChange(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		address = target.value;
		onChange?.({ address, postalCode });
	}

	function handlePostalCodeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		postalCode = target.value;
		onChange?.({ address, postalCode });
	}
</script>

<div class={inline ? 'grid grid-cols-1 md:grid-cols-[1fr,200px] gap-4' : 'space-y-4'}>
	<FormField label={addressLabel} {required} error={errorAddress} id="address">
		<Textarea
			id="address"
			placeholder={addressPlaceholder}
			rows={inline ? 2 : 3}
			value={address}
			oninput={handleAddressChange}
			class={errorAddress ? 'border-destructive' : ''}
		/>
	</FormField>

	<FormField label={postalCodeLabel} {required} error={errorPostalCode} id="postalCode">
		<Input
			id="postalCode"
			type="text"
			placeholder={postalCodePlaceholder}
			maxlength={5}
			value={postalCode}
			oninput={handlePostalCodeChange}
			class={errorPostalCode ? 'border-destructive' : ''}
		/>
	</FormField>
</div>
