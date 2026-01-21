<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { User, Settings, LogOut, ShieldAlert } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	interface Props {
		userName?: string;
		userRole?: string;
		isImpersonating?: boolean;
		onSignOut?: () => void;
		class?: string;
	}

	let {
		userName = 'Admin User',
		userRole = 'Super Admin',
		isImpersonating = false,
		onSignOut,
		class: className
	}: Props = $props();

	const initials = $derived(
		userName
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	);
</script>

<div class={cn('flex items-center gap-2', className)}>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props }: { props: Record<string, any> })}
				<button
					{...props}
					class={cn(
						'relative flex h-10 w-full items-center justify-start gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
						className
					)}
				>
					<Avatar.Root class="h-8 w-8">
						<Avatar.Fallback
							class={cn(
								isImpersonating ? 'bg-amber-500 text-white' : 'bg-primary text-primary-foreground'
							)}
						>
							{initials}
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="flex flex-col items-start text-left">
						<p class="text-sm font-medium leading-none">{userName}</p>
						<p class="text-xs leading-none text-muted-foreground mt-1">{userRole}</p>
					</div>
				</button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-56">
			<DropdownMenu.Label class="font-normal">
				<div class="flex flex-col space-y-1">
					<p class="text-sm font-medium leading-none">{userName}</p>
					<p class="text-xs leading-none text-muted-foreground">{userRole}</p>
				</div>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			{#if isImpersonating}
				<DropdownMenu.Item class="text-warning focus:text-warning cursor-pointer">
					<ShieldAlert class="mr-2 h-4 w-4" />
					<span>Stop Impersonation</span>
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
			{/if}
			<DropdownMenu.Group>
				<DropdownMenu.Item class="cursor-pointer p-0">
					<a href="/admin/profile" class="flex w-full items-center px-2 py-1.5">
						<User class="mr-2 h-4 w-4" />
						<span>Profile</span>
					</a>
				</DropdownMenu.Item>
				<DropdownMenu.Item class="cursor-pointer p-0">
					<a href="/admin/settings" class="flex w-full items-center px-2 py-1.5">
						<Settings class="mr-2 h-4 w-4" />
						<span>Settings</span>
					</a>
				</DropdownMenu.Item>
			</DropdownMenu.Group>
			<DropdownMenu.Separator />
			<DropdownMenu.Item
				onSelect={onSignOut}
				class="text-destructive focus:text-destructive cursor-pointer"
			>
				<LogOut class="mr-2 h-4 w-4" />
				<span>Sign out</span>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</div>
