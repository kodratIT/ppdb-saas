<script lang="ts">
	import {
		LayoutDashboard,
		School,
		Users,
		CreditCard,
		FileText,
		Settings,
		LogOut,
		Cpu,
		Megaphone,
		FileCheck,
		Package,
		Building2,
		Ticket,
		LineChart,
		UserCog,
		Activity,
		Shield,
		ShieldAlert,
		ShieldCheck,
		UserPlus,
		Menu,
		X,
		Gauge
	} from 'lucide-svelte';
	import { page } from '$app/state';
	import AdminSidebarGroup from './AdminSidebarGroup.svelte';

	import { i18n } from '$lib/i18n/index.svelte';

	const baseNavigation = $derived([
		{
			name: i18n.t('nav.main'),
			items: [{ name: i18n.t('nav.dashboard'), icon: LayoutDashboard, href: '/admin' }]
		},
		{
			name: i18n.t('nav.management'),
			items: [
				{ name: i18n.t('nav.organizations'), icon: Building2, href: '/admin/schools' },
				{ name: i18n.t('nav.registerSchool'), icon: UserPlus, href: '/admin/register' },
				{ name: i18n.t('nav.schoolUnits'), icon: School, href: '/admin/units' },
				{ name: i18n.t('nav.verification'), icon: ShieldCheck, href: '/admin/verification' },
				{ name: i18n.t('nav.broadcastCenter'), icon: Megaphone, href: '/admin/broadcast' },
				{ name: i18n.t('nav.announcements'), icon: Megaphone, href: '/admin/announcements' },
				{ name: i18n.t('nav.supportTickets'), icon: Ticket, href: '/admin/tickets' }
			]
		},
		{
			name: i18n.t('nav.subscription'),
			items: [
				{ name: i18n.t('nav.overview'), icon: LayoutDashboard, href: '/admin/subscription' },
				{ name: i18n.t('nav.plans'), icon: Package, href: '/admin/subscription/packages' },
				{
					name: i18n.t('nav.activeSubscriptions'),
					icon: Users,
					href: '/admin/subscription/tenants'
				},
				{
					name: i18n.t('nav.transactions'),
					icon: FileText,
					href: '/admin/subscription/transactions'
				},
				{ name: i18n.t('nav.coupons'), icon: Ticket, href: '/admin/subscription/coupons' },
				{
					name: i18n.t('nav.payouts'),
					icon: CreditCard,
					href: '/admin/subscription/payouts'
				}
			]
		},
		{
			name: i18n.t('nav.analytics'),
			items: [{ name: i18n.t('nav.globalReports'), icon: LineChart, href: '/admin/reports' }]
		},
		{
			name: i18n.t('nav.system'),
			items: [
				{ name: i18n.t('nav.systemOverview'), icon: Gauge, href: '/admin/system/overview' },
				{ name: i18n.t('nav.operations'), icon: Activity, href: '/admin/system/operations' },
				{ name: i18n.t('nav.userManagement'), icon: Users, href: '/admin/system/users' },
				{ name: i18n.t('nav.security'), icon: Shield, href: '/admin/system/security' },
				{ name: i18n.t('nav.auditLogs'), icon: ShieldAlert, href: '/admin/system/audit-logs' },
				{ name: i18n.t('nav.platformSettings'), icon: Settings, href: '/admin/system/settings' }
			]
		}
	]);

	let role = $derived(page.data?.session?.role as string | undefined);
	let isMobileOpen = $state(false);
	let sidebarElement: HTMLElement;
	let hamburgerButton: HTMLButtonElement;

	function toggleMobile() {
		isMobileOpen = !isMobileOpen;
		if (isMobileOpen) {
			// Focus trap handling
			setTimeout(() => {
				sidebarElement?.focus();
			}, 100);
		}
	}

	function closeMobile() {
		isMobileOpen = false;
		hamburgerButton?.focus();
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isMobileOpen) {
			closeMobile();
		}
	}

	// Handle click outside
	function handleClickOutside(event: MouseEvent) {
		if (
			isMobileOpen &&
			sidebarElement &&
			!sidebarElement.contains(event.target as Node) &&
			!hamburgerButton?.contains(event.target as Node)
		) {
			closeMobile();
		}
	}

	// Role-based navigation filter - properly implemented
	let navigation = $derived(
		baseNavigation
			.map((group) => ({
				...group,
				items: group.items.filter((item) => {
					// All roles can see these items for now
					// Add role-specific filtering here when needed
					return true;
				})
			}))
			.filter((group) => group.items.length > 0)
	);
</script>

<!-- Mobile Hamburger Button -->
<div class="fixed top-4 left-4 z-50 lg:hidden">
	<button
		bind:this={hamburgerButton}
		onclick={toggleMobile}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				toggleMobile();
			}
		}}
		class="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
		aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
		aria-expanded={isMobileOpen}
		aria-controls="sidebar-navigation"
	>
		{#if isMobileOpen}
			<X class="h-6 w-6" />
		{:else}
			<Menu class="h-6 w-6" />
		{/if}
	</button>
</div>

<!-- Mobile Overlay -->
{#if isMobileOpen}
	<button
		onclick={closeMobile}
		onkeydown={handleKeydown}
		class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
		aria-label="Close sidebar menu"
	></button>
{/if}

<aside
	bind:this={sidebarElement}
	onkeydown={handleKeydown}
	role="navigation"
	aria-label="Main navigation"
	class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#1e293b] text-slate-300 transition-transform duration-300 shadow-2xl lg:relative lg:translate-x-0 {isMobileOpen
		? 'translate-x-0'
		: '-translate-x-full'}"
	tabindex="-1"
>
	<!-- Logo Area -->
	<div class="flex h-16 items-center gap-3 border-b border-slate-800 px-6 bg-[#0f172a]/50">
		<div
			class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20"
		>
			<Cpu class="h-5 w-5" />
		</div>
		<div class="flex flex-col">
			<span class="text-lg font-bold tracking-tight text-white leading-tight"
				>PPDB <span class="text-primary">Central</span></span
			>
			<span class="text-[10px] font-medium text-slate-500 uppercase tracking-widest"
				>Platform Admin</span
			>
		</div>
	</div>

	<!-- Navigation -->
	<nav
		id="sidebar-navigation"
		class="flex-1 overflow-y-auto p-4 scrollbar-hide"
		aria-label="Primary navigation"
	>
		{#each navigation as group, groupIndex}
			{@const groupLabel = `${group.name} navigation`}
			<div role="group" aria-label={groupLabel}>
				<AdminSidebarGroup {group} />
			</div>
		{/each}
	</nav>

	<!-- Footer / Logout -->
	<div class="border-t border-slate-800 p-4 bg-[#0f172a]/30">
		<form action="/admin/sign-out" method="POST">
			<button
				type="submit"
				class="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 group"
			>
				<LogOut class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
				<span>{i18n.t('nav.signOut')}</span>
			</button>
		</form>
	</div>
</aside>
