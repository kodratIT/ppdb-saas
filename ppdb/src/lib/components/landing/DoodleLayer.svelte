<script lang="ts">
	import { onMount } from 'svelte';

	// Jenis-jenis doodle yang tersedia
	const doodleTypes = ['backpack', 'pencil', 'basketball', 'medal', 'paper', 'lightning'];

	interface Doodle {
		id: number;
		type: string;
		top: string;
		left: string;
		size: string;
		rotation: string;
		delay: string;
		duration: string;
	}

	let doodles: Doodle[] = [
		{
			id: 1,
			type: 'backpack',
			top: '15%',
			left: '5%',
			size: 'w-32 h-32',
			rotation: 'rotate-12',
			delay: '0s',
			duration: '5s'
		},
		{
			id: 2,
			type: 'pencil',
			top: '25%',
			left: '85%',
			size: 'w-20 h-20',
			rotation: '-rotate-45',
			delay: '1s',
			duration: '4s'
		},
		{
			id: 3,
			type: 'basketball',
			top: '65%',
			left: '10%',
			size: 'w-24 h-24',
			rotation: 'rotate-0',
			delay: '0.5s',
			duration: '6s'
		},
		{
			id: 4,
			type: 'medal',
			top: '80%',
			left: '75%',
			size: 'w-28 h-28',
			rotation: '-rotate-12',
			delay: '2s',
			duration: '5.5s'
		},
		{
			id: 5,
			type: 'paper',
			top: '45%',
			left: '92%',
			size: 'w-16 h-16',
			rotation: 'rotate-6',
			delay: '1.5s',
			duration: '4.5s'
		}
	];

	// SVG Doodles with Neo-Brutalism Style
</script>

<div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
	{#each doodles as doodle (doodle.id)}
		<div
			class="absolute transition-transform duration-1000 ease-out {doodle.size} {doodle.rotation}"
			style="top: {doodle.top}; left: {doodle.left}; animation: float {doodle.duration} ease-in-out {doodle.delay} infinite;"
		>
			{#if doodle.type === 'backpack'}
				<svg viewBox="0 0 100 100" class="w-full h-full">
					<rect
						x="20"
						y="30"
						width="60"
						height="50"
						rx="10"
						fill="#0000FF"
						stroke="black"
						stroke-width="4"
					/>
					<rect
						x="30"
						y="20"
						width="40"
						height="20"
						rx="5"
						fill="#CCFF00"
						stroke="black"
						stroke-width="4"
					/>
					<path d="M40 80 L40 90 M60 80 L60 90" stroke="black" stroke-width="4" />
				</svg>
			{:else if doodle.type === 'pencil'}
				<svg viewBox="0 0 100 100" class="w-full h-full">
					<rect
						x="10"
						y="40"
						width="70"
						height="20"
						fill="#FF00FF"
						stroke="black"
						stroke-width="4"
					/>
					<path d="M80 40 L95 50 L80 60 Z" fill="#CCFF00" stroke="black" stroke-width="4" />
					<path d="M10 40 L5 40 L5 60 L10 60 Z" fill="black" />
				</svg>
			{:else if doodle.type === 'basketball'}
				<svg viewBox="0 0 100 100" class="w-full h-full">
					<circle cx="50" cy="50" r="40" fill="#FF6B00" stroke="black" stroke-width="4" />
					<path
						d="M10 50 Q50 10 90 50 M10 50 Q50 90 90 50 M50 10 L50 90"
						fill="none"
						stroke="black"
						stroke-width="3"
					/>
				</svg>
			{:else if doodle.type === 'medal'}
				<svg viewBox="0 0 100 100" class="w-full h-full">
					<path
						d="M30 10 L50 40 L70 10"
						fill="none"
						stroke="#0000FF"
						stroke-width="8"
						stroke-linecap="round"
					/>
					<circle cx="50" cy="60" r="30" fill="#FFD700" stroke="black" stroke-width="4" />
					<text x="50" y="70" text-anchor="middle" font-size="30" font-weight="black" fill="black"
						>1</text
					>
				</svg>
			{:else if doodle.type === 'paper'}
				<svg viewBox="0 0 100 100" class="w-full h-full">
					<rect x="20" y="10" width="60" height="80" fill="white" stroke="black" stroke-width="4" />
					<path d="M30 30 H70 M30 50 H70 M30 70 H50" stroke="black" stroke-width="3" />
				</svg>
			{/if}
		</div>
	{/each}
</div>

<style>
	@keyframes float {
		0%,
		100% {
			transform: translateY(0) rotate(var(--tw-rotate, 0deg));
		}
		50% {
			transform: translateY(-20px) rotate(calc(var(--tw-rotate, 0deg) + 5deg));
		}
	}
</style>
