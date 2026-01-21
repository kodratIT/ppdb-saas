<script lang="ts">
	import { Bell } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils';

	interface Props {
		count?: number;
		onClick?: () => void;
		class?: string;
	}

	let { count = 0, onClick, class: className }: Props = $props();
</script>

<div class={cn('relative', className)}>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props }: { props: Record<string, any> })}
				<button
					{...props}
					class={cn(
						'relative flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
						className
					)}
					onclick={onClick}
				>
					<Bell class="h-5 w-5" />
					{#if count > 0}
						<Badge
							variant="destructive"
							class="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-[10px]"
						>
							{count > 9 ? '9+' : count}
						</Badge>
					{/if}
					<span class="sr-only">Notifications</span>
				</button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-80">
			<DropdownMenu.Label>Notifications</DropdownMenu.Label>
			<DropdownMenu.Separator />
			{#if count === 0}
				<div class="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
			{:else}
				<!-- Placeholder for notifications list -->
				<div class="max-h-80 overflow-y-auto">
					<DropdownMenu.Item class="cursor-pointer">
						<div class="flex flex-col gap-1">
							<p class="text-sm font-medium">New school registration</p>
							<p class="text-xs text-muted-foreground">2 minutes ago</p>
						</div>
					</DropdownMenu.Item>
					<DropdownMenu.Item class="cursor-pointer">
						<div class="flex flex-col gap-1">
							<p class="text-sm font-medium">System update completed</p>
							<p class="text-xs text-muted-foreground">1 hour ago</p>
						</div>
					</DropdownMenu.Item>
				</div>
			{/if}
			<DropdownMenu.Separator />
			<DropdownMenu.Item class="w-full cursor-pointer justify-center text-primary">
				View all notifications
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
