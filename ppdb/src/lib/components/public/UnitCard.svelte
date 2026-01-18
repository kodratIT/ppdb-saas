<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight, School, GraduationCap, Baby, BookOpen, Library } from 'lucide-svelte';

	let { unit, tenantSlug }: { unit: any; tenantSlug: string } = $props();

	// Map level to icon
	const levelIcons: Record<string, any> = {
		TK: Baby,
		SD: School,
		SMP: BookOpen,
		SMA: GraduationCap,
		SMK: Library,
		Universitas: GraduationCap
	};

	const Icon = $derived(levelIcons[unit.level] || School);

	// Determine accent colors based on level
	const levelColors: Record<string, string> = {
		TK: 'bg-pink-100 text-pink-600 border-pink-200',
		SD: 'bg-red-100 text-red-600 border-red-200',
		SMP: 'bg-blue-100 text-blue-600 border-blue-200',
		SMA: 'bg-gray-100 text-gray-800 border-gray-200',
		SMK: 'bg-orange-100 text-orange-600 border-orange-200',
		Universitas: 'bg-indigo-100 text-indigo-600 border-indigo-200'
	};

	const colorClass = $derived(
		levelColors[unit.level] || 'bg-slate-100 text-slate-600 border-slate-200'
	);
</script>

<Card.Root
	class="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2"
>
	<Card.Header class="pb-2">
		<div
			class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border {colorClass} transition-transform duration-300 group-hover:scale-110"
		>
			<Icon class="h-6 w-6" />
		</div>
		<Card.Title class="text-xl font-bold tracking-tight">{unit.name}</Card.Title>
		<Card.Description class="font-medium text-muted-foreground">
			Level: {unit.level}
		</Card.Description>
	</Card.Header>

	<Card.Content>
		<p class="text-sm text-muted-foreground line-clamp-2">
			{unit.config?.description || `Pendaftaran resmi untuk unit ${unit.name}.`}
		</p>
	</Card.Content>

	<Card.Footer>
		<Button
			href="/{tenantSlug}/register?unit_id={unit.id}"
			class="w-full justify-between font-bold rounded-xl"
		>
			Pilih Unit
			<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
		</Button>
	</Card.Footer>

	<!-- Subtle background pattern or decoration -->
	<div
		class="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-5 transition-transform duration-500 group-hover:scale-150 {colorClass.split(
			' '
		)[0]}"
	></div>
</Card.Root>
