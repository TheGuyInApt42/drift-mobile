<script lang="ts">
	interface Props {
		animationType?: 'rain' | 'candle' | 'none';
		isActive?: boolean;
	}

	let { animationType = 'none', isActive = false }: Props = $props();

	// Debug logging
	$effect(() => {
		console.log('AmbientAnimations - isActive:', isActive, 'animationType:', animationType);
	});
</script>

{#if isActive && animationType === 'rain'}
	<!-- Subtle rain animation overlay -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
		<div class="rain-container">
			{#each Array(40) as _, i}
				<div
					class="raindrop"
					style="--delay: {Math.random() * 5}s; --duration: {5 +
						Math.random() * 3}s; left: {Math.random() * 100}%;"
				></div>
			{/each}
		</div>
	</div>
{/if}

{#if isActive && animationType === 'candle'}
	<!-- Candle flicker animation overlay -->
	<div class="pointer-events-none absolute inset-0 overflow-hidden">
		<div class="candle-flicker-container">
			{#each Array(8) as _, i}
				<div
					class="flame"
					style="--delay: {Math.random() * 3}s; --x: {20 + Math.random() * 60}%; --y: {20 +
						Math.random() * 60}%;"
				></div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.rain-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.raindrop {
		position: absolute;
		width: 1.5px;
		height: 20px;
		background: linear-gradient(to bottom, rgba(148, 163, 184, 0.6), rgba(148, 163, 184, 0.2));
		border-radius: 0.5px;
		animation:
			rain-fall var(--duration) linear infinite,
			fade-in 1s ease-in;
		animation-delay: var(--delay), var(--delay);
		opacity: 0;
	}

	@keyframes rain-fall {
		0% {
			transform: translateY(-100vh);
		}
		100% {
			transform: translateY(100vh);
		}
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	.candle-flicker-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.flame {
		position: absolute;
		width: 4px;
		height: 12px;
		background: radial-gradient(
			ellipse at center,
			rgba(251, 191, 36, 0.8),
			rgba(251, 191, 36, 0.4),
			transparent
		);
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
		left: var(--x);
		top: var(--y);
		animation: flame-flicker 2s ease-in-out infinite;
		animation-delay: var(--delay);
		box-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
	}

	@keyframes flame-flicker {
		0%,
		100% {
			transform: scale(1) rotate(-2deg);
			opacity: 0.8;
		}
		25% {
			transform: scale(1.1) rotate(1deg);
			opacity: 1;
		}
		50% {
			transform: scale(0.9) rotate(-1deg);
			opacity: 0.9;
		}
		75% {
			transform: scale(1.05) rotate(2deg);
			opacity: 0.95;
		}
	}
</style>
