<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { Switch } from '$lib/components/ui/switch';
	import { Save, X, Plus, Trash2, Info } from 'lucide-svelte';
	import { t } from '$lib/i18n/index.svelte';
	import { cn } from '$lib/utils';
	import type { SaasPackage } from '$lib/server/domain/admin/plans';

	interface Feature {
		key: string;
		name: string;
		category: string;
	}

	interface Props {
		plan?: SaasPackage | null;
		allFeatures?: Feature[];
		isLoading?: boolean;
		onSave?: (data: any) => void;
		onCancel?: () => void;
	}

	let { plan = null, allFeatures = [], isLoading = false, onSave, onCancel }: Props = $props();

	// Form state
	let formData = $state({
		id: plan?.id || '',
		name: plan?.name || '',
		slug: plan?.slug || '',
		description: plan?.description || '',
		priceMonthly: plan?.priceMonthly || 0,
		priceYearly: plan?.priceYearly || 0,
		isActive: plan?.isActive ?? true,
		limits: {
			maxStudents: null,
			maxAdmins: null,
			maxDocumentsPerStudent: null,
			storageGb: 0,
			whatsappBlastCredits: 0,
			customDomains: false,
			advancedAnalytics: false,
			prioritySupport: false,
			apiAccess: false,
			whiteLabel: false,
			sla: '',
			...(plan?.limits as any)
		},
		features: (plan?.features as string[]) || []
	});

	let newFeature = $state('');

	function addCustomFeature() {
		const feat = newFeature.trim();
		if (feat && !formData.features.includes(feat)) {
			formData.features = [...formData.features, feat];
		}
		newFeature = '';
	}

	function removeFeature(feat: string) {
		formData.features = formData.features.filter((f) => f !== feat);
	}

	function toggleFeature(feat: string) {
		if (formData.features.includes(feat)) {
			removeFeature(feat);
		} else {
			formData.features = [...formData.features, feat];
		}
	}

	function handleSubmit() {
		onSave?.(formData);
	}

	function calculateSavings() {
		if (formData.priceMonthly === 0) return 0;
		const monthlyEquivalent = formData.priceYearly / 12;
		const savings = ((formData.priceMonthly - monthlyEquivalent) / formData.priceMonthly) * 100;
		return Math.round(savings);
	}
</script>

<form
	class="space-y-8"
	onsubmit={(e) => {
		e.preventDefault();
		handleSubmit();
	}}
>
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<div class="space-y-2">
			<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Plan Name *</Label
			>
			<Input bind:value={formData.name} placeholder="e.g., Professional" required />
		</div>
		<div class="space-y-2">
			<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
				>Slug *</Label
			>
			<Input bind:value={formData.slug} placeholder="e.g., professional" required />
		</div>
	</div>

	<div class="space-y-2">
		<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
			>Description</Label
		>
		<Textarea
			bind:value={formData.description}
			placeholder="Short description for customers..."
			rows={3}
		/>
	</div>

	<div class="space-y-4">
		<h3 class="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
			Pricing
			<div class="h-px flex-1 bg-border"></div>
		</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="space-y-2">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Monthly Price (IDR)</Label
				>
				<Input type="number" bind:value={formData.priceMonthly} />
			</div>
			<div class="space-y-2">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Yearly Price (IDR)</Label
				>
				<Input type="number" bind:value={formData.priceYearly} />
				{#if formData.priceMonthly > 0 && formData.priceYearly > 0}
					<p class="text-[10px] text-green-600 font-bold">
						Savings: {calculateSavings()}% per year
					</p>
				{/if}
			</div>
		</div>
	</div>

	<div class="space-y-4">
		<h3 class="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
			Limits & Quotas
			<div class="h-px flex-1 bg-border"></div>
		</h3>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="space-y-2">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Max Students</Label
				>
				<Input type="number" bind:value={formData.limits.maxStudents} placeholder="Unlimited" />
			</div>
			<div class="space-y-2">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Max Admins</Label
				>
				<Input type="number" bind:value={formData.limits.maxAdmins} placeholder="Unlimited" />
			</div>
			<div class="space-y-2">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Storage (GB)</Label
				>
				<Input type="number" bind:value={formData.limits.storageGb} />
			</div>
			<div class="space-y-2">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>WhatsApp Credits</Label
				>
				<Input type="number" bind:value={formData.limits.whatsappBlastCredits} />
			</div>
			<div class="space-y-2">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>Docs per Student</Label
				>
				<Input type="number" bind:value={formData.limits.maxDocumentsPerStudent} />
			</div>
			<div class="space-y-2">
				<Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>SLA Guaranteed</Label
				>
				<Input bind:value={formData.limits.sla} placeholder="e.g. 99.9%" />
			</div>
		</div>

		<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
			<div class="flex flex-col gap-2 p-3 rounded-lg border bg-muted/20">
				<div class="flex items-center justify-between">
					<Label class="text-[10px] font-black uppercase">Domain</Label>
					<Switch bind:checked={formData.limits.customDomains} />
				</div>
				<p class="text-[9px] text-muted-foreground">Custom Domains</p>
			</div>
			<div class="flex flex-col gap-2 p-3 rounded-lg border bg-muted/20">
				<div class="flex items-center justify-between">
					<Label class="text-[10px] font-black uppercase">Analytics</Label>
					<Switch bind:checked={formData.limits.advancedAnalytics} />
				</div>
				<p class="text-[9px] text-muted-foreground">Advanced Analytics</p>
			</div>
			<div class="flex flex-col gap-2 p-3 rounded-lg border bg-muted/20">
				<div class="flex items-center justify-between">
					<Label class="text-[10px] font-black uppercase">Support</Label>
					<Switch bind:checked={formData.limits.prioritySupport} />
				</div>
				<p class="text-[9px] text-muted-foreground">Priority Support</p>
			</div>
			<div class="flex flex-col gap-2 p-3 rounded-lg border bg-muted/20">
				<div class="flex items-center justify-between">
					<Label class="text-[10px] font-black uppercase">API Access</Label>
					<Switch bind:checked={formData.limits.apiAccess} />
				</div>
				<p class="text-[9px] text-muted-foreground">API Integration</p>
			</div>
			<div class="flex flex-col gap-2 p-3 rounded-lg border bg-muted/20">
				<div class="flex items-center justify-between">
					<Label class="text-[10px] font-black uppercase">White Label</Label>
					<Switch bind:checked={formData.limits.whiteLabel} />
				</div>
				<p class="text-[9px] text-muted-foreground">Remove Branding</p>
			</div>
		</div>
	</div>

	<div class="space-y-4">
		<h3 class="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
			Features List
			<div class="h-px flex-1 bg-border"></div>
		</h3>
		<div class="flex flex-wrap gap-2">
			{#each allFeatures as feat}
				<Badge
					variant={formData.features.includes(feat.name) ? 'default' : 'outline'}
					class="cursor-pointer"
					onclick={() => toggleFeature(feat.name)}
				>
					{feat.name}
				</Badge>
			{/each}
		</div>
		<div class="flex gap-2">
			<Input
				bind:value={newFeature}
				placeholder="Add custom feature..."
				class="h-9"
				onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
			/>
			<Button type="button" variant="outline" size="sm" onclick={addCustomFeature}>
				<Plus class="h-4 w-4 mr-1" /> Add
			</Button>
		</div>
		{#if formData.features.length > 0}
			<div class="flex flex-wrap gap-2 pt-2">
				{#each formData.features as feat}
					{#if !allFeatures.find((f) => f.name === feat)}
						<Badge variant="secondary" class="pl-2 pr-1 py-1">
							{feat}
							<button
								type="button"
								class="ml-1 hover:text-destructive"
								onclick={() => removeFeature(feat)}
							>
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<div class="flex items-center justify-between pt-6 border-t">
		<div class="flex items-center gap-2">
			<Switch bind:checked={formData.isActive} id="plan-active" />
			<Label for="plan-active" class="text-xs font-bold cursor-pointer">Active Plan</Label>
		</div>
		<div class="flex gap-3">
			{#if onCancel}
				<Button type="button" variant="ghost" onclick={onCancel} disabled={isLoading}>Cancel</Button
				>
			{/if}
			<Button type="submit" disabled={isLoading}>
				{#if isLoading}
					<span
						class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
					></span>
				{:else}
					<Save class="h-4 w-4 mr-2" />
				{/if}
				{plan ? 'Update Plan' : 'Create Plan'}
			</Button>
		</div>
	</div>
</form>
