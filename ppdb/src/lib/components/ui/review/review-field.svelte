<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		label: string;
		value?: string | number | null;
		badge?: {
			label: string;
			variant?: 'default' | 'secondary' | 'destructive' | 'outline';
		};
		masked?: boolean;
		mono?: boolean;
		highlight?: boolean;
	}

	let { label, value, badge, masked = false, mono = false, highlight = false }: Props = $props();

	const displayValue = $derived(() => {
		if (masked) return '••••••••';
		if (value === null || value === undefined || value === '') return '-';
		return String(value);
	});
</script>

<div class="space-y-1">
	<p class="text-sm text-muted-foreground">{label}</p>
	<div class="flex items-center gap-2">
		{#if badge}
			<Badge variant={badge.variant || 'default'}>{badge.label}</Badge>
		{:else}
			<p class="font-medium {mono ? 'font-mono text-sm' : ''} {highlight ? 'text-primary' : ''}">
				{displayValue()}
			</p>
		{/if}
	</div>
</div>
