<script lang="ts">
	import confetti from 'canvas-confetti';
	import { onMount } from 'svelte';

	interface Props {
		duration?: number;
		particleCount?: number;
		spread?: number;
		origin?: { x: number; y: number };
	}

	let {
		duration = 3000,
		particleCount = 200,
		spread = 70,
		origin = { x: 0.5, y: 0.5 }
	}: Props = $props();

	onMount(() => {
		// Fire confetti on mount
		const end = Date.now() + duration;

		const frame = () => {
			confetti({
				particleCount: 2,
				angle: 60,
				spread: spread,
				origin: { x: 0, y: 0.6 },
				colors: ['#002C5F', '#0066CC', '#4A90E2']
			});
			confetti({
				particleCount: 2,
				angle: 120,
				spread: spread,
				origin: { x: 1, y: 0.6 },
				colors: ['#002C5F', '#0066CC', '#4A90E2']
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		};

		// Initial burst
		confetti({
			particleCount: particleCount,
			spread: spread,
			origin: origin,
			colors: ['#002C5F', '#0066CC', '#4A90E2', '#FFD700']
		});

		// Continuous confetti
		frame();
	});
</script>

<!-- This component doesn't render anything visible, it just triggers confetti -->
