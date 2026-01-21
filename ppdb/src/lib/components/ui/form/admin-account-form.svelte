<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import FormField from './form-field.svelte';
	import PasswordInput from './password-input.svelte';
	import WhatsAppInput from './whatsapp-input.svelte';
	import EmailInput from './email-input.svelte';

	interface AdminData {
		adminName: string;
		email: string;
		password: string;
		whatsapp: string;
	}

	interface Props {
		data: AdminData;
		errors?: Record<string, string[]>;
		onChange?: (data: AdminData) => void;
		showPasswordStrength?: boolean;
		checkEmailAvailability?: (email: string) => Promise<boolean>;
	}

	let {
		data = $bindable({
			adminName: '',
			email: '',
			password: '',
			whatsapp: ''
		}),
		errors = {},
		onChange,
		showPasswordStrength = true,
		checkEmailAvailability
	}: Props = $props();

	function handleAdminNameChange(e: Event) {
		const target = e.target as HTMLInputElement;
		data.adminName = target.value;
		onChange?.(data);
	}

	function handleEmailChange(email: string) {
		data.email = email;
		onChange?.(data);
	}

	function handlePasswordChange(e: Event) {
		const target = e.target as HTMLInputElement;
		data.password = target.value;
		onChange?.(data);
	}

	function handleWhatsAppChange(value: string) {
		data.whatsapp = value;
		onChange?.(data);
	}
</script>

<div class="space-y-5">
	<!-- Admin Full Name -->
	<FormField
		label="Admin Full Name"
		required
		error={errors.adminName}
		helpText="This is the name of the person who will manage the school's PPDB system."
		id="adminName"
	>
		<Input
			id="adminName"
			type="text"
			placeholder="e.g., Budi Santoso"
			value={data.adminName || ''}
			oninput={handleAdminNameChange}
			class={errors.adminName ? 'border-destructive' : ''}
		/>
	</FormField>

	<!-- Email -->
	<EmailInput
		value={data.email}
		error={errors.email}
		required
		onCheck={checkEmailAvailability}
		oninput={(e) => handleEmailChange((e.target as HTMLInputElement).value)}
	/>

	<!-- Password -->
	<PasswordInput
		value={data.password}
		error={errors.password}
		required
		showStrength={showPasswordStrength}
		oninput={handlePasswordChange}
	/>

	<!-- WhatsApp -->
	<WhatsAppInput
		value={data.whatsapp}
		error={errors.whatsapp}
		required
		onChange={handleWhatsAppChange}
	/>
</div>
