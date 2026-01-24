<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { ArrowLeft, Save } from 'lucide-svelte';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData, form: ActionData } = $props();
</script>

<div class="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/admin/subscription/coupons">
			<ArrowLeft class="h-4 w-4" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">New Coupon</h1>
			<p class="text-muted-foreground">Create a new discount code.</p>
		</div>
	</div>

	<form method="POST" use:enhance>
		<Card.Root>
			<Card.Header>
				<Card.Title>Coupon Details</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				<div class="grid gap-2">
					<Label for="code">Coupon Code</Label>
					<Input id="code" name="code" placeholder="PROMO2026" class="uppercase" value={form?.data?.code ?? ''} />
					{#if form?.errors?.code}
						<p class="text-sm text-red-500">{form.errors.code[0]}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="type">Discount Type</Label>
						<select id="type" name="type" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
							<option value="percentage">Percentage (%)</option>
							<option value="fixed_amount">Fixed Amount (IDR)</option>
						</select>
					</div>
					<div class="grid gap-2">
						<Label for="value">Value</Label>
						<Input id="value" name="value" type="number" placeholder="10" value={form?.data?.value ?? ''} />
						{#if form?.errors?.value}
							<p class="text-sm text-red-500">{form.errors.value[0]}</p>
						{/if}
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="maxRedemptions">Max Redemptions (Optional)</Label>
						<Input id="maxRedemptions" name="maxRedemptions" type="number" placeholder="Unlimited" value={form?.data?.maxRedemptions ?? ''} />
					</div>
					<div class="grid gap-2">
						<Label for="expiresAt">Expiration Date (Optional)</Label>
						<Input id="expiresAt" name="expiresAt" type="date" value={form?.data?.expiresAt ?? ''} />
					</div>
				</div>

				<div class="flex items-center space-x-2">
					<Checkbox id="isActive" name="isActive" checked={form?.data?.isActive !== false} />
					<Label for="isActive">Coupon is active and usable</Label>
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-end gap-2 border-t p-6">
				<Button variant="outline" href="/admin/subscription/coupons">Cancel</Button>
				<Button type="submit"><Save class="mr-2 h-4 w-4" /> Create Coupon</Button>
			</Card.Footer>
		</Card.Root>
	</form>
</div>
