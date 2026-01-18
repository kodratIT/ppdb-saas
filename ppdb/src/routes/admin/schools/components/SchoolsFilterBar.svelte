<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Input } from '$lib/components/ui/input';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select';
	import { Search } from 'lucide-svelte';

	let search = $state(page.url.searchParams.get('search') || '');
	let status = $state(page.url.searchParams.get('status') || 'all');

	let timer: ReturnType<typeof setTimeout>;

	function updateFilters() {
		const url = new URL(page.url);
		if (search) {
			url.searchParams.set('search', search);
		} else {
			url.searchParams.delete('search');
		}

		if (status && status !== 'all') {
			url.searchParams.set('status', status);
		} else {
			url.searchParams.delete('status');
		}

		url.searchParams.set('page', '1');
		goto(url.toString(), { keepFocus: true, replaceState: true });
	}

	function handleSearch() {
		clearTimeout(timer);
		timer = setTimeout(updateFilters, 300);
	}

	function handleStatusChange(value: string | undefined) {
		status = value || 'all';
		updateFilters();
	}
</script>

<div class="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
	<div class="relative flex-1">
		<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
		<Input
			type="text"
			placeholder="Cari sekolah berdasarkan nama atau slug..."
			class="pl-10"
			bind:value={search}
			oninput={handleSearch}
		/>
	</div>
	<div class="w-full md:w-48">
		<Select type="single" value={status} onValueChange={handleStatusChange}>
			<SelectTrigger>
				<SelectValue placeholder="Status" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">Semua Status</SelectItem>
				<SelectItem value="active">Active</SelectItem>
				<SelectItem value="inactive">Inactive</SelectItem>
			</SelectContent>
		</Select>
	</div>
</div>
