<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Check, Plus } from 'lucide-svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	let plans = [
		{
			name: 'Basic',
			price: 'IDR 500k',
			period: i18n.t('admin.plans.month'),
			features: ['Up to 500 Students', 'Basic Reporting', 'Email Support'],
			active: true,
			popular: false
		},
		{
			name: 'Pro',
			price: 'IDR 1.2M',
			period: i18n.t('admin.plans.month'),
			features: [
				'Unlimited Students',
				'Advanced Analytics',
				'WhatsApp Integration',
				'Priority Support'
			],
			active: true,
			popular: true
		},
		{
			name: 'Enterprise',
			price: i18n.t('admin.plans.custom'),
			period: '',
			features: ['Custom Domain', 'SLA 99.9%', 'Dedicated Account Manager'],
			active: true,
			popular: false
		}
	];
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{i18n.t('admin.plans.title')}</h1>
			<p class="text-muted-foreground mt-1">{i18n.t('admin.plans.subtitle')}</p>
		</div>
		<Button>
			<Plus class="mr-2 h-4 w-4" />
			{i18n.t('admin.plans.addNewPlan')}
		</Button>
	</div>

	<div class="grid gap-6 md:grid-cols-3">
		{#each plans as plan}
			<Card.Root class="relative flex flex-col {plan.popular ? 'border-blue-500 shadow-lg' : ''}">
				{#if plan.popular}
					<div
						class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white"
					>
						{i18n.t('admin.plans.mostPopular')}
					</div>
				{/if}
				<Card.Header>
					<Card.Title class="text-xl">{plan.name}</Card.Title>
					<div class="mt-2 flex items-baseline gap-1">
						<span class="text-3xl font-bold">{plan.price}</span>
						<span class="text-sm text-muted-foreground">{plan.period}</span>
					</div>
				</Card.Header>
				<Card.Content class="flex-1">
					<ul class="space-y-3">
						{#each plan.features as feature}
							<li class="flex items-center gap-2 text-sm">
								<Check class="h-4 w-4 text-green-500" />
								{feature}
							</li>
						{/each}
					</ul>
				</Card.Content>
				<Card.Footer>
					<Button variant="outline" class="w-full">{i18n.t('admin.plans.editPlan')}</Button>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
</div>
