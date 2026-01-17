<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Users, FileCheck, School, DollarSign, ArrowRight } from 'lucide-svelte';
	import { page } from '$app/stores';

	export let data;

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
		<p class="text-muted-foreground">Overview of your school's admission status.</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Applicants</CardTitle>
				<Users class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.applicants}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Verified</CardTitle>
				<FileCheck class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.verified}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.applicants > 0
						? Math.round((data.stats.verified / data.stats.applicants) * 100)
						: 0}% verification rate
				</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Active Paths</CardTitle>
				<School class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.activePaths}</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Revenue</CardTitle>
				<DollarSign class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{formatCurrency(data.stats.revenue)}</div>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<Card class="hover:bg-gray-50 transition-colors">
			<a href="/{$page.params.tenant}/admin/verify" class="block h-full">
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<FileCheck class="h-5 w-5" />
						Verify Applications
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-muted-foreground mb-4">
						Review documents and verify incoming applications.
					</p>
					<div class="flex items-center text-blue-600 text-sm font-medium">
						Go to Verification <ArrowRight class="ml-1 h-4 w-4" />
					</div>
				</CardContent>
			</a>
		</Card>

		<Card class="hover:bg-gray-50 transition-colors">
			<a href="/{$page.params.tenant}/admin/finance" class="block h-full">
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<DollarSign class="h-5 w-5" />
						Finance Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="text-muted-foreground mb-4">Monitor payments and manage invoices.</p>
					<div class="flex items-center text-blue-600 text-sm font-medium">
						Go to Finance <ArrowRight class="ml-1 h-4 w-4" />
					</div>
				</CardContent>
			</a>
		</Card>
	</div>
</div>
