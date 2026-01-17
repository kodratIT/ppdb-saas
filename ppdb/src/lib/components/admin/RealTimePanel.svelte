<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Users, UserPlus, Clock, AlertCircle, ChevronRight, Zap, Activity } from 'lucide-svelte';
	import { onMount } from 'svelte';

	interface Props {
		onlineUsers?: number;
		newRegToday?: number;
		pendingVerifications?: number;
		criticalActions?: Array<{
			id: string;
			title: string;
			time: string;
			type: 'verification' | 'payment' | 'system';
		}>;
	}

	let {
		onlineUsers = 0,
		newRegToday = 0,
		pendingVerifications = 0,
		criticalActions = []
	}: Props = $props();

	// Polling mechanism every 30 seconds
	$effect(() => {
		const interval = setInterval(() => {
			invalidateAll();
		}, 30000);

		return () => clearInterval(interval);
	});
</script>

<div class="sticky top-0 space-y-8">
	<!-- Live Now Section -->
	<div>
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
				Live Now
			</h3>
			<span
				class="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest"
			>
				<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
				Live Feed
			</span>
		</div>

		<div class="space-y-3">
			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div
							class="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
						>
							<Users class="h-4 w-4" />
						</div>
						<div>
							<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
								Online Users
							</p>
							<p class="text-lg font-black text-slate-900 dark:text-slate-100">
								{onlineUsers.toLocaleString()}
							</p>
						</div>
					</div>
					<div
						class="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
					></div>
				</div>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
			>
				<div class="flex items-center gap-3">
					<div
						class="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
					>
						<UserPlus class="h-4 w-4" />
					</div>
					<div>
						<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
							New Reg Today
						</p>
						<p class="text-lg font-black text-slate-900 dark:text-slate-100">+{newRegToday}</p>
					</div>
				</div>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
			>
				<div class="flex items-center gap-3">
					<div
						class="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
					>
						<Clock class="h-4 w-4" />
					</div>
					<div>
						<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
							Pending Verification
						</p>
						<p class="text-lg font-black text-slate-900 dark:text-slate-100">
							{pendingVerifications}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Critical Actions Section -->
	<div>
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
				Critical Actions
			</h3>
			<AlertCircle class="h-4 w-4 text-rose-500" />
		</div>

		<div class="space-y-2">
			{#if criticalActions.length > 0}
				{#each criticalActions as action}
					<button
						class="group flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white/50 p-3 transition-all hover:border-slate-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50"
					>
						<div class="flex items-center gap-3 text-left">
							<div
								class="h-1.5 w-1.5 rounded-full {action.type === 'verification'
									? 'bg-amber-500'
									: 'bg-rose-500'}"
							></div>
							<div>
								<p class="text-xs font-bold text-slate-900 dark:text-slate-100">{action.title}</p>
								<p class="text-[10px] font-medium text-slate-500">{action.time}</p>
							</div>
						</div>
						<ChevronRight
							class="h-3 w-3 text-slate-300 transition-transform group-hover:translate-x-0.5"
						/>
					</button>
				{/each}
			{:else}
				<div
					class="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800"
				>
					<div
						class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300 dark:bg-slate-800"
					>
						<Activity class="h-5 w-5" />
					</div>
					<p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Queue Clear</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- System Optimization Hook -->
	<div class="rounded-2xl bg-slate-900 p-5 text-white shadow-xl ring-1 ring-white/10">
		<div class="mb-4 flex items-center gap-2">
			<div
				class="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500 shadow-lg shadow-blue-500/50"
			>
				<Zap class="h-3.5 w-3.5 fill-white text-white" />
			</div>
			<span class="text-[10px] font-black uppercase tracking-widest">Intelligence Hub</span>
		</div>
		<p class="mb-4 text-xs font-medium leading-relaxed text-slate-400">
			Optimize system performance by managing pending tasks and verifying new entities.
		</p>
		<div class="grid grid-cols-2 gap-2">
			<button
				class="rounded-lg bg-white/5 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-white/10"
			>
				Audit Log
			</button>
			<button
				class="rounded-lg bg-blue-600 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-blue-700"
			>
				Optimize
			</button>
		</div>
	</div>
</div>
