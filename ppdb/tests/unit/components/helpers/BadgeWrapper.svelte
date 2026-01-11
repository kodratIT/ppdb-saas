<script lang="ts">
	import Badge from '$lib/components/ui/badge.svelte';

	interface Props {
		text: string;
		variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'status' | 'role' | 'priority';
		status?: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
		role?: 'super_admin' | 'school_admin' | 'verifier' | 'treasurer';
		priority?: 'low' | 'medium' | 'high' | 'urgent';
	}

	let { text, variant = 'default', status, role, priority }: Props = $props();
</script>

<Badge {variant} {status} {role} {priority}>{text}</Badge>
