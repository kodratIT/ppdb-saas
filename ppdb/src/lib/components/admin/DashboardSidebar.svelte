<script lang="ts">
	import {
		LayoutDashboard,
		BarChart3,
		School,
		LayoutGrid,
		Users,
		CreditCard,
		FileText,
		ShieldAlert,
		Settings,
		LogOut,
		ChevronRight,
		Cpu,
		PlusCircle,
		Megaphone,
		FileCheck,
		Package,
		Building2,
		Ticket,
		LineChart,
		UserCog
	} from 'lucide-svelte';
	import { page } from '$app/state';

	const baseNavigation = [
		{
			group: 'Main',
			items: [{ name: 'Dashboard', icon: LayoutDashboard, href: '/admin' }]
		},
		{
			group: 'Management',
			items: [
				{ name: 'Organizations', icon: Building2, href: '/admin/schools' },
				{ name: 'School Units', icon: School, href: '/admin/units' },
				{ name: 'Announcements', icon: Megaphone, href: '/admin/announcements' },
				{ name: 'Support Tickets', icon: Ticket, href: '/admin/tickets' }
			]
		},
		{
			group: 'Subscription',
			items: [
				{ name: 'Packages', icon: Package, href: '/admin/plans' },
				{ name: 'Active Subs', icon: Users, href: '/admin/subscription/tenants' },
				{ name: 'Transactions', icon: FileText, href: '/admin/subscription/transactions' }
			]
		},
		{
			group: 'Analytics',
			items: [{ name: 'Global Reports', icon: LineChart, href: '/admin/reports' }]
		},
		{
			group: 'System',
			items: [
				{ name: 'Platform Admins', icon: UserCog, href: '/admin/users' },
				{ name: 'Settings', icon: Settings, href: '/admin/settings' }
			]
		}
	];

	let role = $derived(page.data?.session?.role);

	let navigation = $derived(
		baseNavigation
			.map((group) => ({
				...group,
				items: group.items
			}))
			.filter((group) => group.items.length > 0)
	);
</script>

<aside
	class="flex h-screen w-64 flex-col border-r bg-[#002C5F] text-slate-300 transition-all duration-300"
>
	<!-- Logo Area -->
	<div class="flex h-16 items-center gap-3 border-b border-blue-800 px-6">
		<div
			class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/20"
		>
			<Cpu class="h-5 w-5" />
		</div>
		<span class="text-lg font-bold tracking-tight text-white">PPDB Central</span>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 overflow-y-auto py-6">
		{#each navigation as group}
			<div class="mb-8 px-4">
				<h3 class="mb-3 px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
					{group.group}
				</h3>
				<div class="space-y-1">
					{#each group.items as item}
						{@const isActive = page.url.pathname === item.href}
						<a
							href={item.href}
							class="group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 hover:bg-white/5 hover:text-white {isActive
								? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
								: ''}"
						>
							<div class="flex items-center gap-3">
								<item.icon
									class="h-5 w-5 transition-colors {isActive ? 'text-white' : 'text-blue-400'}"
								/>
								<span class="text-sm font-medium">{item.name}</span>
							</div>
							{#if isActive}
								<ChevronRight class="h-4 w-4 text-white/50" />
							{/if}
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</nav>

	<!-- Footer / Logout -->
	<div class="border-t border-blue-800 p-4">
		<button
			class="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all hover:bg-red-500/10 hover:text-red-400"
		>
			<LogOut class="h-5 w-5" />
			<span>Sign Out</span>
		</button>
	</div>
</aside>
