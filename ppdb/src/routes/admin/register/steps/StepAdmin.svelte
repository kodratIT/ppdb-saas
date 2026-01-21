<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { FormField, PasswordInput, WhatsAppInput, EmailInput } from '$lib/components/ui/form';
	import type { AdminFormData } from '../schema';
	import { i18n } from '$lib/i18n/index.svelte';

	interface Props {
		formData: Partial<AdminFormData>;
		errors?: Record<string, string[]>;
		onUpdate: (data: Partial<AdminFormData>) => void;
	}

	let { formData = $bindable(), errors = {}, onUpdate }: Props = $props();

	function handleAdminNameChange(e: Event) {
		const target = e.target as HTMLInputElement;
		formData.adminName = target.value;
		onUpdate(formData);
	}

	function handleEmailChange(e: Event) {
		const target = e.target as HTMLInputElement;
		formData.email = target.value;
		onUpdate(formData);
	}

	function handlePasswordChange(e: Event) {
		const target = e.target as HTMLInputElement;
		formData.password = target.value;
		onUpdate(formData);
	}

	function handleWhatsAppChange(value: string) {
		formData.whatsapp = value;
		onUpdate(formData);
	}

	// Email availability check (placeholder - implement API call)
	async function checkEmailAvailability(email: string): Promise<boolean> {
		// TODO: Implement actual API check
		await new Promise((resolve) => setTimeout(resolve, 300));
		return true; // Simulate available
	}
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-xl font-semibold mb-2">{i18n.t('admin.register.stepAdmin')} 👤</h2>
		<p class="text-sm text-muted-foreground">
			{i18n.t('admin.register.createAdmin')}
		</p>
	</div>

	<!-- Admin Full Name -->
	<FormField
		label={i18n.t('admin.register.adminName')}
		required
		error={errors.adminName}
		helpText={i18n.t('admin.register.adminNote')}
		id="adminName"
	>
		<Input
			id="adminName"
			type="text"
			placeholder="e.g., Budi Santoso"
			value={formData.adminName || ''}
			oninput={handleAdminNameChange}
			class={errors.adminName ? 'border-destructive' : ''}
		/>
	</FormField>

	<!-- Email -->
	<EmailInput
		label={i18n.t('admin.register.adminEmail')}
		value={formData.email || ''}
		error={errors.email}
		required
		helpText={i18n.t('admin.register.emailNote')}
		onCheck={checkEmailAvailability}
		oninput={handleEmailChange}
	/>

	<!-- Password -->
	<PasswordInput
		label={i18n.t('admin.register.adminPassword')}
		value={formData.password || ''}
		error={errors.password}
		required
		showStrength={true}
		placeholder={i18n.t('admin.register.passwordNote')}
		oninput={handlePasswordChange}
	/>

	<!-- WhatsApp -->
	<WhatsAppInput
		label={i18n.t('admin.register.whatsapp')}
		value={formData.whatsapp || ''}
		error={errors.whatsapp}
		required
		onChange={handleWhatsAppChange}
		helpText={i18n.t('admin.register.whatsappNote')}
	/>
</div>
