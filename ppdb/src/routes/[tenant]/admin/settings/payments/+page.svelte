<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Alert } from '$lib/components/ui/alert';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { CheckCircle2, ShieldAlert, Landmark } from 'lucide-svelte';

	export let data;
	let loading = false;
</script>

<svelte:head>
	<title>Payment Settings</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Payment Settings</h1>
		<p class="text-muted-foreground">Payment gateway configuration status.</p>
	</div>

	<!-- System Payment Gateway -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Online Payment (Xendit)</Card.Title>
			<Card.Description>
				Payment gateway is managed centrally by the System Administrator.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if data.hasKey}
				<Alert class="mb-6 bg-green-50 border-green-200 text-green-800 flex items-center gap-2">
					<CheckCircle2 class="w-4 h-4" />
					<span>System Payment Gateway is configured and active.</span>
				</Alert>
				<p class="text-sm text-gray-600">
					Your school can accept online payments via the global payment gateway.
					Funds will be routed according to the system configuration.
				</p>
			{:else}
				<Alert variant="destructive" class="mb-6 flex items-center gap-2">
					<ShieldAlert class="w-4 h-4" />
					<span>System Payment Gateway is NOT configured.</span>
				</Alert>
				<p class="text-sm text-gray-600">
					Online payments are currently disabled. Please contact the System Administrator to enable payments.
				</p>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Manual Payment Settings -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Landmark class="w-5 h-5" />
				Manual Transfer Settings
			</Card.Title>
			<Card.Description>
				Configure bank account details for manual transfer verification.
				These details will be shown to parents who choose manual transfer.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				action="?/updateBankInfo"
				class="space-y-4"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
			>
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="bankName">Bank Name</Label>
						<Input
							id="bankName"
							name="bankName"
							placeholder="e.g. BCA, Mandiri"
							value={data.bankInfo.bankName}
						/>
					</div>
					<div class="space-y-2">
						<Label for="bankAccountName">Account Holder Name</Label>
						<Input
							id="bankAccountName"
							name="bankAccountName"
							placeholder="e.g. Yayasan Sekolah..."
							value={data.bankInfo.bankAccountName}
						/>
					</div>
					<div class="space-y-2 md:col-span-2">
						<Label for="bankAccountNumber">Account Number</Label>
						<Input
							id="bankAccountNumber"
							name="bankAccountNumber"
							placeholder="e.g. 1234567890"
							value={data.bankInfo.bankAccountNumber}
						/>
					</div>
				</div>

				<div class="flex justify-end pt-4">
					<Button type="submit" disabled={loading}>
						{loading ? 'Saving...' : 'Save Bank Details'}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
