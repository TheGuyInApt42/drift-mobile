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
	aria-pressed={isTextMode}
	aria-label={isTextMode ? 'Switch to audio mode' : 'Switch to reading mode'}
	class="flex h-11 w-11 items-center justify-center rounded-full ring-1 backdrop-blur-md transition {isTextMode
		? 'bg-amber-500/20 text-amber-300 ring-amber-500/30'
		: 'bg-slate-800/60 text-slate-400 ring-white/10 hover:bg-slate-800/80'}"
>
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
</button>