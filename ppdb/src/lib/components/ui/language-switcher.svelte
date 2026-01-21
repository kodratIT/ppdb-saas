<script lang="ts">
	import { i18n } from '$lib/i18n/index.svelte';
	import { locales } from '$lib/i18n/config';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Button from '$lib/components/ui/button.svelte';
	import { Globe } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let { variant = 'dropdown', showLabel = true } = $props<{
		variant?: 'dropdown' | 'toggle';
		showLabel?: boolean;
	}>();

	const currentLocale = $derived(locales.find((l) => l.code === i18n.language) || locales[0]);
</script>

{#if variant === 'dropdown'}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props }: { props: Record<string, any> })}
				<button
					{...props}
					class={cn(
						'inline-flex h-9 items-center justify-start gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full md:w-auto'
					)}
				>
					<Globe class="h-4 w-4" />
					{#if showLabel}
						<span>{currentLocale.name}</span>
					{/if}
					<span class="text-xs">{currentLocale.flag}</span>
				</button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			{#each locales as locale}
				<DropdownMenu.Item onSelect={() => i18n.setLanguage(locale.code)}>
					<span class="mr-2">{locale.flag}</span>
					{locale.name}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<!-- Toggle variant implementation if needed, for now defaulting to dropdown logic mostly -->
	<div class="flex gap-2">
		{#each locales as locale}
			<Button
				variant={i18n.language === locale.code ? 'default' : 'outline'}
				size="sm"
				onclick={() => i18n.setLanguage(locale.code)}
			>
				<span class="mr-2">{locale.flag}</span>
				{locale.code.toUpperCase()}
			</Button>
		{/each}
	</div>
{/if}
