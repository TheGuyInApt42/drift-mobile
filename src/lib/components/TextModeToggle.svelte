<script lang="ts">
	interface Props {
		isTextMode?: boolean;
		onToggle?: (enabled: boolean) => void;
	}

	let { isTextMode = $bindable(false), onToggle = () => {} }: Props = $props();

	function toggleTextMode() {
		const newState = !isTextMode;
		isTextMode = newState;
		onToggle(newState);
	}
</script>

<button
	onclick={toggleTextMode}
	class="group inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm ring-1 backdrop-blur-md transition hover:bg-slate-800/80 {isTextMode
		? 'bg-amber-500/20 text-amber-300 ring-amber-500/30'
		: 'bg-slate-800/60 ring-white/10'}"
	aria-pressed={isTextMode}
>
	<!-- Text mode icon -->
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		{#if isTextMode}
			<!-- Active state - book with text lines -->
			<path
				d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M8 7h8M8 11h6M8 15h4"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
			/>
		{:else}
			<!-- Inactive state - simple book -->
			<path
				d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/if}
	</svg>

	<span class="opacity-80 group-hover:opacity-100">
		{isTextMode ? 'Reading Mode' : 'Audio Mode'}
	</span>
</button>
