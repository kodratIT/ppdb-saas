<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { Switch } from '$lib/components/ui/switch';
	import { Separator } from '$lib/components/ui/separator';
	import { ArrowLeft, Save } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { FEATURE_DICT } from '$lib/config/package-features';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Initialize with initialData (for Duplicate) or empty defaults
	let pkgData = $state(
		form?.data ||
			data.initialData || {
				name: '',
				slug: '',
				description: '',
				priceMonthly: 0,
				priceYearly: 0,
				isActive: true
			}
	);

	let limits = $state(
		form?.data?.limits
			? JSON.parse(form.data.limits)
			: data.initialData?.limits || {}
	);
	let features = $state(
		form?.data?.features
			? JSON.parse(form.data.features)
			: data.initialData?.features || []
	);

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
</script>

<div class="container mx-auto py-10 max-w-5xl space-y-8">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/admin/subscription/packages">
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">New Package</h1>
			<p class="text-muted-foreground">Create a new subscription plan from scratch or copy.</p>
		</div>
	</div>

	<form method="POST" use:enhance>
		<!-- Hidden fields for JSON -->
		<input type="hidden" name="features" value={JSON.stringify(features)} />
		<input type="hidden" name="limits" value={JSON.stringify(limits)} />

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
							<Input
								id="name"
								name="name"
								bind:value={pkgData.name}
								placeholder="e.g. Starter Plan"
							/>
							{#if form?.errors?.name}
								<p class="text-xs text-red-500">{form.errors.name[0]}</p>
							{/if}
						</div>

						<div class="grid gap-2">
							<Label for="slug">URL Slug</Label>
							<Input id="slug" name="slug" bind:value={pkgData.slug} placeholder="starter-plan" />
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
				<Save class="mr-2 h-4 w-4" /> Create Package
			</Button>
		</div>
	</form>
</div>
