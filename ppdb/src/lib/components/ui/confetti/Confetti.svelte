<script lang="ts">
	import confetti from 'canvas-confetti';
	import { onMount } from 'svelte';

	let { options = {} } = $props<{ options?: confetti.Options }>();

	onMount(() => {
		const duration = 3000;
		const animationEnd = Date.now() + duration;
		const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

		const randomInRange = (min: number, max: number) => {
			return Math.random() * (max - min) + min;
		};

		// If specific options provided, run once with those
		if (Object.keys(options).length > 0) {
			confetti({
				zIndex: 9999,
				...options
			});
			return;
		}

		// Default "Party Mode" burst if no options provided
		const interval: any = setInterval(function () {
			const timeLeft = animationEnd - Date.now();

			if (timeLeft <= 0) {
				return clearInterval(interval);
			}

			const particleCount = 50 * (timeLeft / duration);

			// since particles fall down, start a bit higher than random
			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
				zIndex: 9999
			});
			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
				zIndex: 9999
			});
		}, 250);

		return () => clearInterval(interval);
	});
</script>

<div class="fixed inset-0 pointer-events-none z-50"></div>
