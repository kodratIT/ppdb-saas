<script lang="ts">
	import { School, Activity, Shield } from 'lucide-svelte';

	let { total, active } = $props<{
		total: number;
		active: number;
	}>();
</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
	<div class="bg-white p-6 rounded-xl border shadow-sm">
		<div class="flex items-center gap-4 mb-2">
			<div class="p-2 bg-blue-50 text-blue-600 rounded-lg"><School class="w-5 h-5" /></div>
			<span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Sekolah</span>
		</div>
		<p class="text-4xl font-black text-[#002C5F]">{total}</p>
	</div>
	<div class="bg-white p-6 rounded-xl border shadow-sm">
		<div class="flex items-center gap-4 mb-2">
			<div class="p-2 bg-green-50 text-green-600 rounded-lg"><Activity class="w-5 h-5" /></div>
			<span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Sekolah Aktif</span>
		</div>
		<p class="text-4xl font-black text-green-600">
			{active}
		</p>
	</div>
	<div class="bg-white p-6 rounded-xl border shadow-sm">
		<div class="flex items-center gap-4 mb-2">
			<div class="p-2 bg-purple-50 text-purple-600 rounded-lg"><Shield class="w-5 h-5" /></div>
			<span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Security Status</span>
		</div>
		<p class="text-xl font-black text-purple-600 uppercase italic">Enterprise Safe</p>
	</div>
</div>
