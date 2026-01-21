<script lang="ts">
	import { Search, Filter, X } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import Button from '$lib/components/ui/button.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import Label from '$lib/components/ui/label.svelte';
	import { cn } from '$lib/utils';
	import Badge from '$lib/components/ui/badge.svelte';
	import { i18n } from '$lib/i18n/index.svelte';

	interface Props {
		placeholder?: string;
		value?: string;
		field?: string;
		operator?: string;
		delay?: number;
		class?: string;
		onchange?: (val?: string) => void;
	}

	let {
		placeholder = i18n.t('common.search'),
		value = $bindable(''),
		field = $bindable('all'),
		operator = $bindable('contains'),
		delay = 300,
		class: className,
		onchange
	}: Props = $props();

	let open = $state(false);
	let timer: ReturnType<typeof setTimeout>;

	const fields = $derived([
		{ value: 'all', label: i18n.t('admin.schools.allFields') },
		{ value: 'name', label: i18n.t('admin.schools.schoolName') },
		{ value: 'slug', label: i18n.t('admin.schools.slugId') }
	]);

	const operators = $derived([
		{ value: 'contains', label: i18n.t('admin.schools.contains') },
		{ value: 'starts_with', label: i18n.t('admin.schools.startsWith') },
		{ value: 'exact', label: i18n.t('admin.schools.exactMatch') }
	]);

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;

		if (delay > 0) {
			clearTimeout(timer);
			timer = setTimeout(() => {
				if (onchange) onchange(value);
			}, delay);
		} else {
			if (onchange) onchange(value);
		}
	}

	function handleFilterChange() {
		// Trigger search update when filters change
		if (onchange) onchange(value);
	}

	let activeFiltersCount = $derived((field !== 'all' ? 1 : 0) + (operator !== 'contains' ? 1 : 0));

	let selectedFieldLabel = $derived(
		fields.find((f) => f.value === field)?.label ?? i18n.t('admin.schools.allFields')
	);
	let selectedOperatorLabel = $derived(
		operators.find((o) => o.value === operator)?.label ?? i18n.t('admin.schools.contains')
	);

	function resetFilters() {
		field = 'all';
		operator = 'contains';
		if (onchange) onchange(value);
		open = false;
	}
</script>

<div class={cn('relative w-full group flex items-center gap-2', className)}>
	<div class="relative flex-1">
		<Search
			class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300"
		/>
		<Input
			type="search"
			{placeholder}
			{value}
			oninput={handleInput}
			class="pl-11 pr-4 py-2 h-10 rounded-xl bg-slate-100/50 border-slate-200 focus-visible:ring-blue-500/10 focus-visible:border-blue-500/30 transition-all duration-300 w-full"
		/>
	</div>

	<Popover.Root bind:open>
		<Popover.Trigger>
			<Button
				variant={activeFiltersCount > 0 ? 'secondary' : 'outline'}
				size="icon"
				class="h-10 w-10 shrink-0 relative"
			>
				<Filter class="h-4 w-4" />
				{#if activeFiltersCount > 0}
					<span class="absolute -top-1 -right-1 flex h-3 w-3">
						<span
							class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
						></span>
						<span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
					</span>
				{/if}
			</Button>
		</Popover.Trigger>
		<Popover.Content align="end" class="w-80">
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h4 class="font-medium leading-none">{i18n.t('admin.schools.advancedSearch')}</h4>
					{#if activeFiltersCount > 0}
						<Button
							variant="ghost"
							size="sm"
							onclick={resetFilters}
							class="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
						>
							{i18n.t('actions.reset')}
						</Button>
					{/if}
				</div>

				<div class="space-y-2">
					<Label>{i18n.t('admin.schools.searchField')}</Label>
					<Select.Root type="single" bind:value={field} onValueChange={handleFilterChange}>
						<Select.Trigger class="w-full">
							{selectedFieldLabel}
						</Select.Trigger>
						<Select.Content>
							{#each fields as f}
								<Select.Item value={f.value} label={f.label}>{f.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label>{i18n.t('admin.schools.operator')}</Label>
					<Select.Root type="single" bind:value={operator} onValueChange={handleFilterChange}>
						<Select.Trigger class="w-full">
							{selectedOperatorLabel}
						</Select.Trigger>
						<Select.Content>
							{#each operators as op}
								<Select.Item value={op.value} label={op.label}>{op.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="pt-2 text-[10px] text-muted-foreground">
					<p>
						{i18n.t('admin.schools.currentFilter', {
							field: `<strong>${selectedFieldLabel}</strong>`,
							operator: selectedOperatorLabel.toLowerCase(),
							value: `<strong>"${value || '...'}"</strong>`
						})}
					</p>
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>
</div>
