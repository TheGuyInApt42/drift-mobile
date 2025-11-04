<script lang="ts">
	import { ambient, toggleAmbient as toggleAmbientGlobal } from '$lib/state/ambient.svelte';

	interface Props {
		onToggle?: (enabled: boolean) => void;
	}

	let { onToggle = () => {} }: Props = $props();

	// The ambient state comes from the global store
	let isEnabled = $derived(ambient.enabled);

	function toggleAmbient() {
		toggleAmbientGlobal();
		onToggle(ambient.enabled);
	}
</script>

<button
	onclick={toggleAmbient}
	class="group inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm ring-1 backdrop-blur-md transition hover:bg-slate-800/80 {isEnabled
		? 'bg-amber-500/20 text-amber-300 ring-amber-500/30'
		: 'bg-slate-800/60 ring-white/10'}"
	aria-pressed={isEnabled}
>
	<!-- Ambient sound icon -->
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		{#if isEnabled}
			<!-- Active state - sound waves -->
			<path
				d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9Z"
				stroke="currentColor"
				stroke-width="1.5"
				opacity="0.3"
			/>
			<path
				d="M3 12a6 6 0 0 1 6-6 6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6Z"
				stroke="currentColor"
				stroke-width="1.5"
				opacity="0.6"
			/>
			<circle cx="12" cy="12" r="3" fill="currentColor" class="animate-pulse" />
		{:else}
			<!-- Inactive state - muted sound -->
			<path
				d="M11 5L6 9H2v6h4l5 4V5z"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/if}
	</svg>

	<span class="opacity-80 group-hover:opacity-100">
		Ambient {isEnabled ? 'On' : 'Off'}
	</span>
</button>
