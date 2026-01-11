<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';

	interface Props {
		text: string;
		variant?: 'default' | 'secondary' | 'destructive' | 'outline';
	}

	let { text, variant = 'default' }: Props = $props();
</script>

<Badge {variant}>{text}</Badge>
