<script lang="ts">
	/* DashboardSkeleton.svelte - Svelte 5 Skeleton Placeholder */
</script>

<div class="space-y-8 animate-pulse">
	<!-- Header Skeleton -->
	<div class="flex justify-between items-end">
		<div>
			<div class="h-9 w-64 bg-slate-200 rounded-md mb-2"></div>
			<div class="h-3 w-32 bg-slate-100 rounded-sm"></div>
		</div>
		<div class="text-right hidden md:block">
			<div class="h-3 w-16 bg-slate-100 rounded-sm ml-auto mb-1"></div>
			<div class="h-5 w-24 bg-slate-200 rounded-md"></div>
		</div>
	</div>

	<!-- KPI Grid Skeleton -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each Array(8) as _}
			<div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-3">
				<div class="flex justify-between items-start">
					<div class="h-3 w-20 bg-slate-100 rounded"></div>
					<div class="w-8 h-8 bg-slate-50 rounded-lg"></div>
				</div>
				<div class="h-8 w-24 bg-slate-200 rounded-md"></div>
				<div class="h-3 w-32 bg-slate-50 rounded"></div>
			</div>
		{/each}
	</div>

	<!-- Charts Skeleton -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<div class="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[380px]">
			<div class="flex justify-between items-center mb-8">
				<div class="space-y-2">
					<div class="h-4 w-32 bg-slate-200 rounded"></div>
					<div class="h-2 w-24 bg-slate-100 rounded"></div>
				</div>
				<div class="h-4 w-20 bg-slate-100 rounded"></div>
			</div>
			<div class="w-full h-56 bg-slate-50/50 rounded-lg flex items-end gap-2 p-4">
				{#each Array(12) as _, i}
					<div
						class="flex-1 bg-slate-100 rounded-t"
						style="height: {20 + Math.sin(i) * 10 + Math.random() * 40}%"
					></div>
				{/each}
			</div>
		</div>

		<div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[380px]">
			<div class="space-y-2 mb-8">
				<div class="h-4 w-32 bg-slate-200 rounded"></div>
				<div class="h-2 w-24 bg-slate-100 rounded"></div>
			</div>
			<div class="space-y-6">
				{#each Array(4) as _}
					<div class="space-y-2">
						<div class="flex justify-between">
							<div class="h-3 w-20 bg-slate-100 rounded"></div>
							<div class="h-3 w-12 bg-slate-100 rounded"></div>
						</div>
						<div class="h-8 w-full bg-slate-50 rounded"></div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Pipeline Skeleton -->
	<div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
		<div class="p-6 border-b bg-slate-50/50 flex justify-between">
			<div class="h-4 w-32 bg-slate-200 rounded"></div>
			<div class="h-4 w-16 bg-slate-200 rounded"></div>
		</div>
		<div class="p-6 space-y-4">
			{#each Array(5) as _}
				<div class="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
					<div class="w-10 h-10 bg-slate-100 rounded-lg"></div>
					<div class="flex-1 space-y-2">
						<div class="h-3 w-1/4 bg-slate-100 rounded"></div>
						<div class="h-2 w-1/6 bg-slate-50 rounded"></div>
					</div>
					<div class="h-4 w-24 bg-slate-100 rounded"></div>
					<div class="h-4 w-16 bg-slate-50 rounded hidden md:block"></div>
				</div>
			{/each}
		</div>
	</div>
</div>
