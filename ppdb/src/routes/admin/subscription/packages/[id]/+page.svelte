<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	import { AlertCircle, ArrowLeft, Save, Plus, Trash2, Info } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { FEATURE_DICT } from '$lib/config/package-features';
	import * as Alert from '$lib/components/ui/alert';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let pkgData = $state(form?.data || data.pkg);
	let subscriberCount = data.subscriberCount;

	// State for JSON fields
	let limits = $state(data.pkg.limits || {});
	let features = $state(data.pkg.features || []);

	// State for Versioning Option
	let useVersioning = $state(subscriberCount > 0);

	function toggleFeature(key: string) {
		if (features.includes(key)) {
			features = features.filter((f: string) => f !== key);
		} else {
			features = [...features, key];
		}
	}

	function updateLimit(key: string, value: number) {
		limits = { ...limits, [key]: value };
	}

	// Dynamic features (not in DICT)
	let customFeatures = $derived(features.filter((f: string) => !FEATURE_DICT.features.some(d => d.key === f)));
</script>

<div class="container mx-auto py-10 max-w-5xl space-y-8">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="icon" href="/admin/subscription/packages">
				<ArrowLeft class="h-4 w-4" />
			</Button>
			<div>
				<h1 class="text-3xl font-bold tracking-tight">Edit Package</h1>
				<p class="text-muted-foreground">Configure plan details, pricing, and limits.</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			{#if subscriberCount > 0}
				<Badge variant="outline" class="h-8">
					<Info class="mr-1 h-3 w-3" />
					{subscriberCount} Active Subscribers
				</Badge>
			{/if}
		</div>
	</div>

	<form method="POST" use:enhance>
		<!-- Hidden fields for JSON and Stats -->
		<input type="hidden" name="features" value={JSON.stringify(features)} />
		<input type="hidden" name="limits" value={JSON.stringify(limits)} />
		<input type="hidden" name="subscriberCount" value={subscriberCount} />
		<input type="hidden" name="useVersioning" value={useVersioning} />

		<div class="grid gap-6 md:grid-cols-3">
			<!-- Left Column: Basics & Pricing -->
			<div class="md:col-span-2 space-y-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>General Information</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="grid gap-2">
							<Label for="name">Package Name</Label>
							<Input id="name" name="name" bind:value={pkgData.name} placeholder="e.g. Pro Plan" />
							{#if form?.errors?.name}
								<p class="text-xs text-red-500">{form.errors.name[0]}</p>
							{/if}
						</div>

						<div class="grid gap-2">
							<Label for="slug">URL Slug</Label>
							<Input id="slug" name="slug" bind:value={pkgData.slug} placeholder="pro-plan" />
							<p class="text-[10px] text-muted-foreground">Used in URLs and API identifies.</p>
							{#if form?.errors?.slug}
								<p class="text-xs text-red-500">{form.errors.slug[0]}</p>
							{/if}
						</div>

						<div class="grid gap-2">
							<Label for="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								bind:value={pkgData.description}
								placeholder="What makes this plan special?"
							/>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title>Pricing</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="grid gap-2">
								<Label for="priceMonthly">Monthly Price (IDR)</Label>
								<Input
									id="priceMonthly"
									name="priceMonthly"
									type="number"
									bind:value={pkgData.priceMonthly}
								/>
							</div>
							<div class="grid gap-2">
								<Label for="priceYearly">Yearly Price (IDR)</Label>
								<Input
									id="priceYearly"
									name="priceYearly"
									type="number"
									bind:value={pkgData.priceYearly}
								/>
							</div>
						</div>
						<p class="text-xs text-muted-foreground">
							Tip: Set yearly price lower than 12x monthly to offer a discount.
						</p>
					</Card.Content>
				</Card.Root>

				{#if subscriberCount > 0}
					<Alert.Root variant="destructive" class="bg-destructive/5 border-destructive/20">
						<AlertCircle class="h-4 w-4" />
						<Alert.Title>Safety & Grandfathering</Alert.Title>
						<Alert.Description class="space-y-3">
							<p>This package has <strong>{subscriberCount}</strong> active subscribers.</p>
							<div class="flex items-center gap-4 mt-2">
								<div class="flex items-center space-x-2">
									<Switch id="versioning" bind:checked={useVersioning} />
									<Label for="versioning" class="font-bold">Create New Version</Label>
								</div>
							</div>
							<p class="text-xs">
								{#if useVersioning}
									Recommended: Current subscribers stay on the old price/limits. A new package will be created for new users.
								{:else}
									Warning: All existing subscribers will be updated to these new prices and limits on their next billing cycle.
								{/if}
							</p>
						</Alert.Description>
					</Alert.Root>
				{/if}
			</div>

			<!-- Right Column: Features & Limits -->
			<div class="space-y-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>Limits</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						{#each FEATURE_DICT.limits as limit}
							<div class="grid gap-2">
								<div class="flex justify-between items-center">
									<Label for={limit.key}>{limit.label}</Label>
									{#if limit.suffix}
										<span class="text-[10px] text-muted-foreground uppercase font-bold"
											>{limit.suffix}</span
										>
									{/if}
								</div>
								<Input
									id={limit.key}
									type="number"
									value={limits[limit.key] || 0}
									oninput={(e) => updateLimit(limit.key, parseInt(e.currentTarget.value))}
								/>
							</div>
						{/each}
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title>Features</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						{#each FEATURE_DICT.features as feature}
							<div class="flex items-center justify-between">
								<div class="grid gap-0.5">
									<Label class="text-sm font-medium leading-none">
										{feature.label}
									</Label>
									{#if feature.description}
										<p class="text-[10px] text-muted-foreground">{feature.description}</p>
									{/if}
								</div>
								<Switch
									checked={features.includes(feature.key)}
									onCheckedChange={() => toggleFeature(feature.key)}
								/>
							</div>
						{/each}
						
						<Separator />
						
						<div class="flex items-center justify-between">
							<Label for="isActive" class="font-bold">Active Status</Label>
							<Switch id="isActive" name="isActive" bind:checked={pkgData.isActive} />
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>

		<div class="flex justify-end gap-3 mt-8 border-t pt-6">
			<Button variant="outline" href="/admin/subscription/packages">Cancel</Button>
			<Button type="submit" size="lg" class="px-8">
				<Save class="mr-2 h-4 w-4" /> 
				{useVersioning ? 'Create New Version' : 'Save Changes'}
			</Button>
		</div>
	</form>
</div>
