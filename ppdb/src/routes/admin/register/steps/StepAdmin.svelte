<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { AdminFormData } from '../schema';

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

	function handleWhatsappChange(e: Event) {
		const target = e.target as HTMLInputElement;
		formData.whatsapp = target.value;
		onUpdate(formData);
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-xl font-semibold mb-2">Admin Account 👤</h2>
		<p class="text-sm text-muted-foreground">
			Create the super admin account for your school. This account will have full access to manage
			the school's PPDB system.
		</p>
	</div>

	<!-- Admin Full Name -->
	<div class="space-y-2">
		<Label for="adminName">Admin Full Name *</Label>
		<Input
			id="adminName"
			type="text"
			placeholder="e.g., Budi Santoso"
			value={formData.adminName || ''}
			oninput={handleAdminNameChange}
			class={errors.adminName ? 'border-destructive' : ''}
		/>
		{#if errors.adminName}
			<p class="text-sm text-destructive">{errors.adminName[0]}</p>
		{/if}
		<p class="text-xs text-muted-foreground">
			This is the name of the person who will manage the school's PPDB system.
		</p>
	</div>

	<!-- Email -->
	<div class="space-y-2">
		<Label for="email">Email Address *</Label>
		<Input
			id="email"
			type="email"
			placeholder="e.g., admin@school.sch.id"
			value={formData.email || ''}
			oninput={handleEmailChange}
			class={errors.email ? 'border-destructive' : ''}
		/>
		{#if errors.email}
			<p class="text-sm text-destructive">{errors.email[0]}</p>
		{/if}
		<p class="text-xs text-muted-foreground">
			This email will be used to log in to the admin dashboard.
		</p>
	</div>

	<!-- Password -->
	<div class="space-y-2">
		<Label for="password">Password *</Label>
		<Input
			id="password"
			type="password"
			placeholder="Minimum 6 characters"
			value={formData.password || ''}
			oninput={handlePasswordChange}
			class={errors.password ? 'border-destructive' : ''}
		/>
		{#if errors.password}
			<p class="text-sm text-destructive">{errors.password[0]}</p>
		{/if}
		<p class="text-xs text-muted-foreground">
			Choose a strong password with at least 6 characters.
		</p>
	</div>

	<!-- WhatsApp -->
	<div class="space-y-2">
		<Label for="whatsapp">WhatsApp Number *</Label>
		<Input
			id="whatsapp"
			type="tel"
			placeholder="e.g., +62812345678"
			value={formData.whatsapp || ''}
			oninput={handleWhatsappChange}
			class={errors.whatsapp ? 'border-destructive' : ''}
		/>
		{#if errors.whatsapp}
			<p class="text-sm text-destructive">{errors.whatsapp[0]}</p>
		{/if}
		<p class="text-xs text-muted-foreground">
			Include country code (e.g., +62 for Indonesia). This will be used for important notifications.
		</p>
	</div>
</div>
