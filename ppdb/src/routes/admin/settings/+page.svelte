<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/input.svelte';
	import Label from '$lib/components/ui/label.svelte';
	import Textarea from '$lib/components/ui/textarea.svelte';
	import FormError from '$lib/components/forms/form-error.svelte';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Switch } from '$lib/components/ui/switch';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { i18n } from '$lib/i18n/index.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let saving = $state(false);

	// Type guard for form errors
	let errors = $derived(
		form && 'errors' in form && form.errors ? (form.errors as Record<string, string[]>) : null
	);
</script>

<div class="container mx-auto px-4 py-8 max-w-5xl">
	{#if data.role === 'super_admin'}
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.settings.title')}</h1>
				<p class="text-muted-foreground mt-1">
					{i18n.t('admin.settings.subtitle')}
				</p>
			</div>
		</div>

		<Tabs value="general" class="space-y-6">
			<TabsList>
				<TabsTrigger value="general">{i18n.t('admin.settings.general')}</TabsTrigger>
				<TabsTrigger value="billing">{i18n.t('admin.settings.billing')}</TabsTrigger>
				<TabsTrigger value="integrations">{i18n.t('admin.settings.integrations')}</TabsTrigger>
				<TabsTrigger value="security">{i18n.t('admin.settings.security')}</TabsTrigger>
			</TabsList>

			<!-- 1. GENERAL SETTINGS -->
			<TabsContent value="general" class="space-y-6">
				<form
					method="POST"
					action="?/updateSystemConfigs"
					use:enhance={() => {
						saving = true;
						return async ({ update }) => {
							await update();
							saving = false;
						};
					}}
					class="space-y-6"
				>
					<Card.Root>
						<Card.Header>
							<Card.Title>{i18n.t('admin.settings.platformIdentity')}</Card.Title>
							<Card.Description>{i18n.t('admin.settings.platformIdentityDesc')}</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-4">
							<div class="grid gap-2">
								<Label for="platformName">{i18n.t('admin.settings.platformName')}</Label>
								<Input
									id="platformName"
									name="platform_name"
									value={data.configs?.platform_name}
									placeholder={i18n.t('admin.settings.platformNamePlaceholder')}
								/>
							</div>
							<div class="grid gap-2">
								<Label for="supportEmail">{i18n.t('admin.settings.supportEmail')}</Label>
								<Input
									id="supportEmail"
									name="support_email"
									value={data.configs?.support_email}
									placeholder={i18n.t('admin.settings.supportEmailPlaceholder')}
								/>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- SMTP Settings -->
					<Card.Root>
						<Card.Header>
							<Card.Title>{i18n.t('admin.settings.emailServer')}</Card.Title>
							<Card.Description>
								{i18n.t('admin.settings.emailServerDesc')}
							</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-4">
							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<Label for="smtpHost">{i18n.t('admin.settings.smtpHost')}</Label>
									<Input
										id="smtpHost"
										name="smtp_host"
										value={data.configs?.smtp_host}
										placeholder={i18n.t('admin.settings.smtpHostPlaceholder')}
									/>
								</div>
								<div class="space-y-2">
									<Label for="smtpPort">{i18n.t('admin.settings.smtpPort')}</Label>
									<Input
										id="smtpPort"
										name="smtp_port"
										type="number"
										value={data.configs?.smtp_port}
										placeholder={i18n.t('admin.settings.smtpPortPlaceholder')}
									/>
								</div>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<Label for="smtpUser">{i18n.t('admin.settings.smtpUser')}</Label>
									<Input
										id="smtpUser"
										name="smtp_user"
										value={data.configs?.smtp_user}
										placeholder={i18n.t('admin.settings.smtpUserPlaceholder')}
									/>
								</div>
								<div class="space-y-2">
									<Label for="smtpPass">{i18n.t('admin.settings.smtpPass')}</Label>
									<Input
										id="smtpPass"
										name="smtp_pass"
										type="password"
										value={data.configs?.smtp_pass}
										placeholder={i18n.t('admin.settings.smtpPassPlaceholder')}
									/>
								</div>
							</div>
							<div class="flex items-center justify-between rounded-lg border p-4">
								<div class="space-y-0.5">
									<Label class="text-base">{i18n.t('admin.settings.secureConnection')}</Label>
									<p class="text-sm text-muted-foreground">
										{i18n.t('admin.settings.secureConnectionDesc')}
									</p>
								</div>
								<input type="hidden" name="smtp_secure_toggle" value="true" />
								<Switch name="smtp_secure" checked={data.configs?.smtp_secure} />
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title>{i18n.t('admin.settings.maintenanceMode')}</Card.Title>
							<Card.Description>
								{i18n.t('admin.settings.maintenanceModeDesc')}
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="flex items-center justify-between rounded-lg border p-4">
								<div class="space-y-0.5">
									<Label class="text-base">{i18n.t('admin.settings.maintenanceMode')}</Label>
									<p class="text-sm text-muted-foreground">
										{i18n.t('admin.settings.maintenanceModeHelper')}
									</p>
								</div>
								<input type="hidden" name="maintenance_mode_toggle" value="true" />
								<Switch name="maintenance_mode" checked={data.configs?.maintenance_mode} />
							</div>
						</Card.Content>
					</Card.Root>

					<div class="flex justify-end">
						<Button type="submit" disabled={saving}>
							{saving ? i18n.t('admin.settings.saving') : i18n.t('admin.settings.saveGeneral')}
						</Button>
					</div>
				</form>
			</TabsContent>

			<!-- 2. BILLING RULES (Placeholder) -->
			<TabsContent value="billing">
				<form
					method="POST"
					action="?/updateSystemConfigs"
					use:enhance={() => {
						saving = true;
						return async ({ update }) => {
							await update();
							saving = false;
						};
					}}
					class="space-y-6"
				>
					<Card.Root>
						<Card.Header>
							<Card.Title>{i18n.t('admin.settings.subscriptionSettings')}</Card.Title>
							<Card.Description
								>{i18n.t('admin.settings.subscriptionSettingsDesc')}</Card.Description
							>
						</Card.Header>
						<Card.Content class="space-y-4">
							<div class="grid gap-2">
								<Label for="trialDays">{i18n.t('admin.settings.trialDays')}</Label>
								<Input
									id="trialDays"
									name="trial_days"
									type="number"
									value={data.configs?.trial_days}
									placeholder={i18n.t('admin.settings.trialDaysPlaceholder')}
								/>
							</div>
							<div class="grid gap-2">
								<Label for="gracePeriod">{i18n.t('admin.settings.gracePeriod')}</Label>
								<Input
									id="gracePeriod"
									name="grace_period_days"
									type="number"
									value={data.configs?.grace_period_days}
									placeholder={i18n.t('admin.settings.gracePeriodPlaceholder')}
								/>
							</div>
						</Card.Content>
					</Card.Root>

					<!-- Notification Templates -->
					<Card.Root>
						<Card.Header>
							<Card.Title>{i18n.t('admin.settings.notificationTemplates')}</Card.Title>
							<Card.Description>
								{i18n.t('admin.settings.notificationTemplatesDesc')}
							</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-4">
							<div class="space-y-2">
								<Label for="waInvoice">{i18n.t('admin.settings.waInvoice')}</Label>
								<Textarea
									id="waInvoice"
									name="template_wa_invoice"
									value={data.configs?.template_wa_invoice}
									rows={3}
								/>
								<p class="text-xs text-muted-foreground">
									{i18n.t('admin.settings.availableVars', {
										vars: '{{name}}, {{amount}}, {{dueDate}}'
									})}
								</p>
							</div>
							<div class="space-y-2">
								<Label for="waPayment">{i18n.t('admin.settings.waPayment')}</Label>
								<Textarea
									id="waPayment"
									name="template_wa_payment_success"
									value={data.configs?.template_wa_payment_success}
									rows={3}
								/>
								<p class="text-xs text-muted-foreground">
									{i18n.t('admin.settings.availableVars', { vars: '{{name}}, {{amount}}' })}
								</p>
							</div>
							<div class="space-y-2">
								<Label for="emailWelcome">{i18n.t('admin.settings.emailWelcome')}</Label>
								<Textarea
									id="emailWelcome"
									name="template_email_welcome"
									value={data.configs?.template_email_welcome}
									rows={3}
								/>
								<p class="text-xs text-muted-foreground">
									{i18n.t('admin.settings.availableVars', {
										vars: '{{platformName}}, {{schoolName}}'
									})}
								</p>
							</div>
						</Card.Content>
					</Card.Root>

					<div class="flex justify-end">
						<Button type="submit" disabled={saving}>
							{saving ? i18n.t('admin.settings.saving') : i18n.t('admin.settings.saveBilling')}
						</Button>
					</div>
				</form>
			</TabsContent>

			<!-- 3. INTEGRATIONS (Live Status) -->
			<TabsContent value="integrations">
				<form
					method="POST"
					action="?/checkHealth"
					use:enhance={() => {
						saving = true;
						return async ({ update }) => {
							await update();
							saving = false;
						};
					}}
				>
					<Card.Root>
						<Card.Header>
							<Card.Title>{i18n.t('admin.settings.systemIntegrations')}</Card.Title>
							<Card.Description>{i18n.t('admin.settings.systemIntegrationsDesc')}</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="space-y-4">
								<!-- WAHA Status -->
								<div class="flex items-center justify-between border p-4 rounded-lg">
									<div class="flex items-center gap-4">
										<div
											class="h-3 w-3 rounded-full {data.health?.waha.status === 'connected'
												? 'bg-green-500'
												: data.health?.waha.status === 'error'
													? 'bg-red-500'
													: 'bg-yellow-500'}"
										></div>
										<div>
											<p class="font-medium">{i18n.t('admin.settings.whatsappGateway')}</p>
											<p class="text-xs text-muted-foreground">
												{i18n.t('admin.settings.status')}: {data.health?.waha.details ||
													i18n.t('admin.settings.unknown')}
											</p>
											{#if data.health?.waha.latency}
												<p class="text-[10px] text-muted-foreground">
													{i18n.t('admin.settings.latency')}: {data.health.waha.latency}ms
												</p>
											{/if}
										</div>
									</div>
									<Button variant="outline" size="sm" type="submit" disabled={saving}>
										{#if saving}
											{i18n.t('admin.settings.checking')}
										{:else}
											{i18n.t('admin.settings.refreshStatus')}
										{/if}
									</Button>
								</div>

								<!-- Xendit Status -->
								<div class="flex items-center justify-between border p-4 rounded-lg">
									<div class="flex items-center gap-4">
										<div
											class="h-3 w-3 rounded-full {data.health?.xendit.status === 'connected'
												? 'bg-green-500'
												: data.health?.xendit.status === 'error'
													? 'bg-red-500'
													: 'bg-yellow-500'}"
										></div>
										<div>
											<p class="font-medium">{i18n.t('admin.settings.paymentGateway')}</p>
											<p class="text-xs text-muted-foreground">
												{i18n.t('admin.settings.status')}: {data.health?.xendit.details ||
													i18n.t('admin.settings.unknown')}
											</p>
											{#if data.health?.xendit.latency}
												<p class="text-[10px] text-muted-foreground">
													{i18n.t('admin.settings.latency')}: {data.health.xendit.latency}ms
												</p>
											{/if}
										</div>
									</div>
									<Button variant="outline" size="sm" type="submit" disabled={saving}>
										{#if saving}
											{i18n.t('admin.settings.checking')}
										{:else}
											{i18n.t('admin.settings.refreshStatus')}
										{/if}
									</Button>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</form>
			</TabsContent>

			<!-- 4. SECURITY (Placeholder) -->
			<TabsContent value="security" class="space-y-6">
				<!-- Config Form -->
				<form
					method="POST"
					action="?/updateSystemConfigs"
					use:enhance={() => {
						saving = true;
						return async ({ update }) => {
							await update();
							saving = false;
						};
					}}
					class="space-y-6"
				>
					<Card.Root>
						<Card.Header>
							<Card.Title>{i18n.t('admin.settings.securityConfig')}</Card.Title>
							<Card.Description>{i18n.t('admin.settings.securityConfigDesc')}</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-4">
							<div class="grid gap-2">
								<Label for="retention">{i18n.t('admin.settings.auditRetention')}</Label>
								<Input
									id="retention"
									name="audit_retention_days"
									type="number"
									value={data.configs?.audit_retention_days}
									placeholder={i18n.t('admin.settings.auditRetentionPlaceholder')}
								/>
								<p class="text-sm text-muted-foreground">
									{i18n.t('admin.settings.auditRetentionHelper')}
								</p>
							</div>
						</Card.Content>
					</Card.Root>

					<div class="flex justify-end">
						<Button type="submit" disabled={saving}>
							{saving ? i18n.t('admin.settings.saving') : i18n.t('admin.settings.saveSecurity')}
						</Button>
					</div>
				</form>

				<!-- Manual Prune Action -->
				<form
					method="POST"
					action="?/pruneLogs"
					use:enhance={() => {
						const confirmed = confirm(i18n.t('admin.settings.pruneConfirm'));
						if (!confirmed) return ({ cancel }) => cancel();

						saving = true;
						return async ({ update, result }) => {
							await update();
							saving = false;
							if (result.type === 'success' && result.data?.message) {
								alert(result.data.message);
							}
						};
					}}
				>
					<Card.Root class="border-red-200">
						<Card.Header>
							<Card.Title class="text-red-600">{i18n.t('admin.settings.dangerZone')}</Card.Title>
							<Card.Description>{i18n.t('admin.settings.dangerZoneDesc')}</Card.Description>
						</Card.Header>
						<Card.Content class="flex items-center justify-between">
							<div class="space-y-1">
								<p class="font-medium">{i18n.t('admin.settings.pruneLogs')}</p>
								<p class="text-sm text-muted-foreground">
									{i18n.t('admin.settings.pruneLogsDesc', {
										days: data.configs?.audit_retention_days
									})}
								</p>
							</div>
							<Button variant="destructive" type="submit" disabled={saving}>
								{saving ? i18n.t('admin.settings.pruning') : i18n.t('admin.settings.pruneNow')}
							</Button>
						</Card.Content>
					</Card.Root>
				</form>
			</TabsContent>
		</Tabs>
	{:else}
		<!-- EXISTING SCHOOL PROFILE FORM FOR SCHOOL ADMINS -->
		<h1 class="text-3xl font-bold mb-6">{i18n.t('admin.settings.schoolProfileTitle')}</h1>

		{#if form?.success}
			<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
				{i18n.t('admin.settings.profileUpdated')}
			</div>
		{/if}

		{#if form?.error}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{form.error}
			</div>
		{/if}

		<form
			method="POST"
			action="?/updateProfile"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update();
					saving = false;
				};
			}}
			class="space-y-6"
		>
			<!-- Core Fields (MVP) -->
			<div class="bg-white shadow-md rounded-lg p-6 space-y-4">
				<h2 class="text-xl font-semibold mb-4">{i18n.t('admin.settings.basicInfo')}</h2>

				<div>
					<Label for="name" class="block text-gray-700 mb-1">
						{i18n.t('admin.settings.schoolName')} <span class="text-red-500">*</span>
					</Label>
					<Input
						id="name"
						name="name"
						value={data.profile.name}
						required
						class={errors?.name ? 'border-red-500' : ''}
					/>
					<FormError {errors} field="name" />
				</div>

				<div>
					<Label for="description" class="block text-gray-700 mb-1"
						>{i18n.t('admin.settings.description')}</Label
					>
					<Textarea
						id="description"
						name="description"
						value={data.profile.description || ''}
						rows={4}
						class={errors?.description ? 'border-red-500' : ''}
					/>
					<FormError {errors} field="description" />
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label for="contactEmail" class="block text-gray-700 mb-1"
							>{i18n.t('admin.settings.contactEmail')}</Label
						>
						<Input
							type="email"
							id="contactEmail"
							name="contactEmail"
							value={data.profile.contactEmail || ''}
							class={errors?.contactEmail ? 'border-red-500' : ''}
						/>
						<FormError {errors} field="contactEmail" />
					</div>

					<div>
						<Label for="contactPhone" class="block text-gray-700 mb-1"
							>{i18n.t('admin.settings.contactPhone')}</Label
						>
						<Input
							type="tel"
							id="contactPhone"
							name="contactPhone"
							value={data.profile.contactPhone || ''}
							placeholder={i18n.t('admin.settings.phonePlaceholder')}
							class={errors?.contactPhone ? 'border-red-500' : ''}
						/>
						<FormError {errors} field="contactPhone" />
					</div>
				</div>

				<div>
					<Label for="address" class="block text-gray-700 mb-1"
						>{i18n.t('admin.settings.address')}</Label
					>
					<Textarea
						id="address"
						name="address"
						value={data.profile.address || ''}
						rows={3}
						class={errors?.address ? 'border-red-500' : ''}
					/>
					<FormError {errors} field="address" />
				</div>
			</div>

			<!-- Progressive Enhancement Fields -->
			<div class="bg-white shadow-md rounded-lg p-6 space-y-4">
				<h2 class="text-xl font-semibold mb-4">{i18n.t('admin.settings.branding')}</h2>

				<div>
					<Label for="logoUrl" class="block text-gray-700 mb-1"
						>{i18n.t('admin.settings.logoUrl')}</Label
					>
					<Input
						type="url"
						id="logoUrl"
						name="logoUrl"
						value={data.profile.logoUrl || ''}
						placeholder={i18n.t('admin.settings.logoUrlPlaceholder')}
						class={errors?.logoUrl ? 'border-red-500' : ''}
					/>
					<FormError {errors} field="logoUrl" />
				</div>

				<div>
					<Label for="bannerUrl" class="block text-gray-700 mb-1"
						>{i18n.t('admin.settings.bannerUrl')}</Label
					>
					<Input
						type="url"
						id="bannerUrl"
						name="bannerUrl"
						value={data.profile.bannerUrl || ''}
						placeholder={i18n.t('admin.settings.bannerUrlPlaceholder')}
						class={errors?.bannerUrl ? 'border-red-500' : ''}
					/>
					<FormError {errors} field="bannerUrl" />
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label for="primaryColor" class="block text-gray-700 mb-1"
							>{i18n.t('admin.settings.primaryColor')}</Label
						>
						<Input
							type="color"
							id="primaryColor"
							name="primaryColor"
							value={data.profile.primaryColor || '#002C5F'}
							class={errors?.primaryColor ? 'border-red-500 h-10 px-1 py-1' : 'h-10 px-1 py-1'}
						/>
						<FormError {errors} field="primaryColor" />
					</div>

					<div>
						<Label for="secondaryColor" class="block text-gray-700 mb-1"
							>{i18n.t('admin.settings.secondaryColor')}</Label
						>
						<Input
							type="color"
							id="secondaryColor"
							name="secondaryColor"
							value={data.profile.secondaryColor || '#FFFFFF'}
							class={errors?.secondaryColor ? 'border-red-500 h-10 px-1 py-1' : 'h-10 px-1 py-1'}
						/>
						<FormError {errors} field="secondaryColor" />
					</div>
				</div>
			</div>

			<div class="flex justify-end">
				<button
					type="submit"
					disabled={saving}
					class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{saving ? i18n.t('admin.settings.saving') : i18n.t('admin.settings.saveChanges')}
				</button>
			</div>
		</form>
	{/if}
</div>
