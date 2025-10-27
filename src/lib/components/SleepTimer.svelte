<script lang="ts">
	interface Props {
		onTimerSet?: (minutes: number) => void;
		onTimerClear?: () => void;
	}

	let { onTimerSet = () => {}, onTimerClear = () => {} }: Props = $props();

	let isOpen = $state(false);
	let selectedMinutes = $state(0);
	let isActive = $state(false);

	const timerOptions = [
		{ minutes: 15, label: '15 min' },
		{ minutes: 30, label: '30 min' },
		{ minutes: 45, label: '45 min' }
	];

	function setTimer(minutes: number) {
		selectedMinutes = minutes;
		isActive = true;
		isOpen = false;
		onTimerSet(minutes);
	}

	function clearTimer() {
		selectedMinutes = 0;
		isActive = false;
		onTimerClear();
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}
</script>

<div class="relative">
	<!-- Sleep Timer Button -->
	<button
		onclick={toggleDropdown}
		class="group inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm ring-1 backdrop-blur-md transition hover:bg-slate-800/80 {isActive
			? 'bg-amber-500/20 text-amber-300 ring-amber-500/30'
			: 'bg-slate-800/60 ring-white/10'}"
	>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			{#if isActive}
				<!-- Active timer icon -->
				<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
				<path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				<circle cx="12" cy="12" r="2" fill="currentColor" class="animate-pulse" />
			{:else}
				<!-- Sleep timer icon -->
				<path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" stroke="currentColor" stroke-width="1.5" />
				<path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			{/if}
		</svg>
		<span class="opacity-80 group-hover:opacity-100">
			{#if isActive}
				{selectedMinutes} min
			{:else}
				Sleep Timer
			{/if}
		</span>
		<svg
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
			class="transition-transform {isOpen ? 'rotate-180' : ''}"
		>
			<path
				d="M6 9l6 6 6-6"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			class="absolute top-full left-0 z-50 mt-2 w-48 rounded-xl bg-slate-800/90 p-2 shadow-lg ring-1 ring-white/10 backdrop-blur-md"
		>
			{#each timerOptions as option}
				<button
					onclick={() => setTimer(option.minutes)}
					class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-slate-700/50 {isActive &&
					selectedMinutes === option.minutes
						? 'bg-amber-500/20 text-amber-300'
						: ''}"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
						<path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
					{option.label}
					{#if isActive && selectedMinutes === option.minutes}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
							class="ml-auto"
						>
							<path
								d="M20 6L9 17l-5-5"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					{/if}
				</button>
			{/each}

			{#if isActive}
				<div class="my-2 border-t border-white/10"></div>
				<button
					onclick={clearTimer}
					class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
				>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M18 6L6 18M6 6l12 12"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					Clear Timer
				</button>
			{/if}
		</div>
	{/if}

	<!-- Click outside to close -->
	{#if isOpen}
		<div
			class="fixed inset-0 z-[-1]"
			role="button"
			tabindex="-1"
			aria-label="Close dropdown"
			onclick={() => (isOpen = false)}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					isOpen = false;
				}
			}}
		></div>
	{/if}
</div>
