<script lang="ts">
	import DashboardHeader from './DashboardHeader.svelte';
	import DashboardSidebar from './DashboardSidebar.svelte';
	import { History, Zap, Activity } from 'lucide-svelte';

	let { children, rightPanel } = $props();
</script>

<div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
	<!-- Fixed Sidebar -->
	<DashboardSidebar />

	<!-- Main Layout Area -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Fixed Header -->
		<DashboardHeader />

		<!-- Scrollable Content Grid -->
		<main class="flex-1 overflow-y-auto">
			<div class="grid h-full grid-cols-12 gap-0">
				<!-- Center Content -->
				<div class="col-span-12 p-8 lg:col-span-9">
					<div class="mx-auto max-w-6xl">
						{@render children()}
					</div>
				</div>

				<!-- Right Panel -->
				<div
					class="hidden border-l bg-white/50 p-6 backdrop-blur-sm lg:col-span-3 lg:block dark:bg-slate-900/50"
				>
					{#if rightPanel}
						{@render rightPanel()}
					{:else}
						<div class="sticky top-0 space-y-8">
							<!-- System Status -->
							<div>
								<div class="mb-4 flex items-center justify-between">
									<h3
										class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider"
									>
										Live Status
									</h3>
									<span
										class="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest"
									>
										<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
										Online
									</span>
								</div>
								<div class="space-y-3">
									<div class="rounded-xl border bg-white p-3 shadow-sm dark:bg-slate-800">
										<div class="mb-2 flex items-center justify-between text-[10px]">
											<span class="text-slate-500 font-bold uppercase tracking-widest"
												>CPU Load</span
											>
											<span class="font-bold text-slate-900 dark:text-slate-100">12%</span>
										</div>
										<div
											class="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
										>
											<div class="h-full w-[12%] bg-blue-500"></div>
										</div>
									</div>
									<div class="rounded-xl border bg-white p-3 shadow-sm dark:bg-slate-800">
										<div class="mb-2 flex items-center justify-between text-[10px]">
											<span class="text-slate-500 font-bold uppercase tracking-widest"
												>Active Sessions</span
											>
											<span class="font-bold text-slate-900 dark:text-slate-100">1.2k</span>
										</div>
										<div
											class="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
										>
											<div class="h-full w-[65%] bg-blue-500"></div>
										</div>
									</div>
								</div>
							</div>

							<!-- Recent Activity -->
							<div>
								<h3
									class="mb-4 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider"
								>
									Recent Activity
								</h3>
								<div class="space-y-4">
									{#each [1, 2, 3] as i}
										<div class="flex gap-3">
											<div
												class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
											>
												<Activity class="h-4 w-4" />
											</div>
											<div class="space-y-1">
												<p class="text-xs font-bold text-slate-900 dark:text-slate-100">
													New School Registered
												</p>
												<p class="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
													2 minutes ago
												</p>
											</div>
										</div>
									{/each}
								</div>
								<button
									class="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
								>
									<History class="h-3 w-3" />
									Audit Logs
								</button>
							</div>

							<!-- Quick Actions -->
							<div class="rounded-2xl bg-slate-900 p-4 text-white shadow-xl ring-1 ring-white/10">
								<div class="mb-3 flex items-center gap-2">
									<Zap class="h-4 w-4 fill-white text-blue-500" />
									<span class="text-[10px] font-black uppercase tracking-widest">Quick Tools</span>
								</div>
								<p class="mb-4 text-xs font-medium text-slate-400 leading-relaxed">
									Common administrative tasks at your fingertips.
								</p>
								<div class="space-y-2">
									<button
										class="w-full rounded-lg bg-white/5 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-white/10"
									>
										Report
									</button>
									<button
										class="w-full rounded-lg bg-blue-600 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-blue-700"
									>
										Manage
									</button>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</main>
	</div>
</div>
