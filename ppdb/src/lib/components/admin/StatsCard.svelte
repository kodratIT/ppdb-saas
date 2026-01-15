<script lang="ts">
	export let title: string;
	export let value: string | number;
	export let subtitle: string = '';
	export let trend: 'up' | 'down' | 'neutral' = 'neutral';
	export let trendValue: string = '';
    export let iconColor: string = 'text-blue-500';
</script>

<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
			<p class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
		</div>
		<div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-full">
            <slot name="icon">
                <!-- Default Icon -->
                <svg class="w-6 h-6 {iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            </slot>
		</div>
	</div>
	{#if subtitle || trendValue}
		<div class="mt-4 flex items-center text-sm">
			{#if trendValue}
				<span class="font-medium {trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}">
					{trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
				</span>
			{/if}
			{#if subtitle}
				<span class="text-gray-500 dark:text-gray-400 ml-2">{subtitle}</span>
			{/if}
		</div>
	{/if}
</div>
