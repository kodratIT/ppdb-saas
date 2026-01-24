<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui';
	import { Check, X, Info } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { t } from '$lib/i18n/index.svelte';
	import type { SaasPackage } from '$lib/server/domain/admin/plans';

	interface Feature {
		key: string;
		name: string;
		category: string;
		description?: string;
	}

	interface Props {
		plans: SaasPackage[];
		features: Feature[];
	}

	let { plans, features }: Props = $props();

	function hasFeature(plan: SaasPackage, featureKey: string) {
		const planFeatures = plan.features as string[];
		// Check both by key and name for flexibility
		return planFeatures.some(
			(f) =>
				f.toLowerCase().includes(featureKey.toLowerCase()) ||
				featureKey.toLowerCase().includes(f.toLowerCase())
		);
	}

	function getLimitValue(plan: SaasPackage, limitKey: string) {
		const limits = plan.limits as any;
		const val = limits[limitKey];
		if (val === null || val === undefined) return 'Unlimited';
		if (typeof val === 'boolean') return val ? 'Yes' : 'No';
		return val;
	}

	const categories = [...new Set(features.map((f) => f.category))];
</script>

<div class="space-y-8">
	<div class="rounded-2xl border bg-white overflow-hidden shadow-sm">
		<Table>
			<TableHeader>
				<TableRow class="bg-muted/30 hover:bg-muted/30 border-b-2">
					<TableHead
						class="w-64 pl-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
					>
						Feature Comparison
					</TableHead>
					{#each plans as plan}
						<TableHead class="text-center py-6">
							<div class="flex flex-col items-center gap-1">
								<span class="text-sm font-extrabold text-foreground">{plan.name}</span>
								<Badge variant="outline" class="text-[9px] font-bold uppercase">
									{plan.priceMonthly.toLocaleString()} / mo
								</Badge>
							</div>
						</TableHead>
					{/each}
				</TableRow>
			</TableHeader>
			<TableBody>
				<!-- Limits Group -->
				<TableRow class="bg-muted/20">
					<TableCell
						colspan={plans.length + 1}
						class="pl-8 py-2 text-[10px] font-black uppercase tracking-widest text-primary/70"
					>
						Resource Limits
					</TableCell>
				</TableRow>
				{#each [{ key: 'maxStudents', name: 'Max Students' }, { key: 'maxAdmins', name: 'Max Admins' }, { key: 'storageGb', name: 'Storage (GB)' }, { key: 'whatsappBlastCredits', name: 'WhatsApp Credits' }] as limit}
					<TableRow class="hover:bg-muted/5 transition-colors">
						<TableCell class="pl-8 py-4 text-sm font-medium text-muted-foreground">
							{limit.name}
						</TableCell>
						{#each plans as plan}
							<TableCell class="text-center py-4 text-sm font-bold">
								{getLimitValue(plan, limit.key)}
							</TableCell>
						{/each}
					</TableRow>
				{/each}

				<!-- Feature Categories -->
				{#each categories as category}
					<TableRow class="bg-muted/20">
						<TableCell
							colspan={plans.length + 1}
							class="pl-8 py-2 text-[10px] font-black uppercase tracking-widest text-primary/70"
						>
							{category}
						</TableCell>
					</TableRow>
					{#each features.filter((f) => f.category === category) as feature}
						<TableRow class="hover:bg-muted/5 transition-colors">
							<TableCell class="pl-8 py-4">
								<div class="flex flex-col">
									<span class="text-sm font-semibold text-foreground/80">{feature.name}</span>
									{#if feature.description}
										<span class="text-[10px] text-muted-foreground line-clamp-1"
											>{feature.description}</span
										>
									{/if}
								</div>
							</TableCell>
							{#each plans as plan}
								<TableCell class="text-center py-4">
									{#if hasFeature(plan, feature.key) || hasFeature(plan, feature.name)}
										<div
											class="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600"
										>
											<Check class="h-4 w-4" />
										</div>
									{:else}
										<div
											class="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-muted/30 text-muted-foreground/40"
										>
											<X class="h-4 w-4" />
										</div>
									{/if}
								</TableCell>
							{/each}
						</TableRow>
					{/each}
				{/each}
			</TableBody>
		</Table>
	</div>

	<div class="flex justify-end gap-3">
		<Button variant="outline" size="sm">Download PDF Comparison</Button>
	</div>
</div>
