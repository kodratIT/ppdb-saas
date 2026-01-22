<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { MoreHorizontal, Pencil, Trash2, Copy, Check, Info } from 'lucide-svelte';
	import { t } from '$lib/i18n/index.svelte';
	import type { SaasPackage, PlanStats } from '$lib/server/domain/admin/plans';

	interface Props {
		plan: SaasPackage;
		stats?: PlanStats;
		isPopular?: boolean;
		onEdit?: (id: SaasPackage) => void;
		onDelete?: (id: string) => void;
		onDuplicate?: (id: string, name: string) => void;
		onToggleActive?: (id: string, active: boolean) => void;
	}

	let {
		plan,
		stats,
		isPopular = false,
		onEdit,
		onDelete,
		onDuplicate,
		onToggleActive
	}: Props = $props();

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function calculateSavings(p: SaasPackage) {
		const monthlyEquivalent = p.priceYearly / 12;
		const savings = ((p.priceMonthly - monthlyEquivalent) / p.priceMonthly) * 100;
		return Math.round(savings);
	}

	const limits = plan.limits as any;
	const features = plan.features as string[];
</script>

<Card.Root
	class="relative flex flex-col transition-all hover:shadow-md {plan.isActive
		? ''
		: 'opacity-70'} {isPopular ? 'border-primary shadow-sm' : ''}"
>
	{#if isPopular}
		<div
			class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
		>
			{t('admin.plans.mostPopular')}
		</div>
	{/if}

	{#if !plan.isActive}
		<div
			class="absolute inset-0 z-10 flex items-center justify-center bg-background/20 backdrop-blur-[1px]"
		>
			<Badge variant="secondary" class="shadow-sm">Inactive</Badge>
		</div>
	{/if}

	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title class="text-xl font-bold">{plan.name}</Card.Title>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button variant="ghost" size="icon" {...props} class="h-8 w-8">
							<MoreHorizontal class="h-4 w-4" />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item onclick={() => onEdit?.(plan)}>
						<Pencil class="mr-2 h-4 w-4" />
						{t('admin.plans.editPlan')}
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => onDuplicate?.(plan.id, `${plan.name} (Copy)`)}>
						<Copy class="mr-2 h-4 w-4" />
						Duplicate
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => onToggleActive?.(plan.id, !plan.isActive)}>
						{plan.isActive ? 'Deactivate' : 'Activate'}
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item
						class="text-destructive focus:bg-destructive focus:text-destructive-foreground"
						onclick={() => onDelete?.(plan.id)}
					>
						<Trash2 class="mr-2 h-4 w-4" />
						Delete
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<div class="mt-4 flex flex-col">
			<div class="flex items-baseline gap-1">
				<span class="text-3xl font-extrabold tracking-tight">
					{formatCurrency(plan.priceMonthly)}
				</span>
				<span class="text-sm font-medium text-muted-foreground">/mo</span>
			</div>
			{#if plan.priceYearly > 0}
				<div class="mt-1 flex items-center gap-2">
					<span class="text-xs font-medium text-muted-foreground">
						{formatCurrency(plan.priceYearly)}/yr
					</span>
					<Badge variant="outline" class="h-4 border-green-500/50 px-1 text-[10px] text-green-600">
						Save {calculateSavings(plan)}%
					</Badge>
				</div>
			{/if}
		</div>
	</Card.Header>

	<Card.Content class="flex-1">
		{#if plan.description}
			<p class="mb-6 text-sm text-muted-foreground leading-relaxed">
				{plan.description}
			</p>
		{/if}

		{#if stats}
			<div class="mb-6 grid grid-cols-2 gap-3">
				<div class="rounded-lg bg-muted/50 p-2.5 transition-colors hover:bg-muted">
					<p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
						Active Subs
					</p>
					<p class="text-lg font-bold">{stats.activeSubscriptions}</p>
				</div>
				<div class="rounded-lg bg-muted/50 p-2.5 transition-colors hover:bg-muted">
					<p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
						MRR
					</p>
					<p class="text-lg font-bold">{formatCurrency(stats.mrr)}</p>
				</div>
			</div>
		{/if}

		<div class="space-y-3">
			<h4
				class="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
			>
				Features
				<Info class="h-3 w-3" />
			</h4>
			<ul class="space-y-2.5">
				{#each features.slice(0, 6) as feature}
					<li class="flex items-start gap-2.5 text-sm leading-tight text-foreground/90">
						<div class="mt-0.5 rounded-full bg-green-100 p-0.5 text-green-600">
							<Check class="h-3 w-3" />
						</div>
						{feature}
					</li>
				{/each}
				{#if features.length > 6}
					<li class="pl-7 text-xs font-medium text-muted-foreground italic">
						+ {features.length - 6} more features...
					</li>
				{/if}
			</ul>
		</div>
	</Card.Content>

	<Card.Footer class="mt-auto pt-6">
		<Button
			variant={isPopular ? 'default' : 'outline'}
			class="w-full font-semibold transition-all hover:scale-[1.02]"
			onclick={() => onEdit?.(plan)}
		>
			{t('admin.plans.editPlan')}
		</Button>
	</Card.Footer>
</Card.Root>
