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
	<!-- Sleep Timer trigger — icon only, badge shows the active duration -->
	<button
		onclick={toggleDropdown}
		aria-expanded={isOpen}
		aria-label={isActive ? `Sleep timer set, ${selectedMinutes} minutes` : 'Sleep timer'}
		class="relative flex h-11 w-11 items-center justify-center rounded-full ring-1 backdrop-blur-md transition {isActive
			? 'bg-amber-500/20 text-amber-300 ring-amber-500/30'
			: 'bg-slate-800/60 text-slate-400 ring-white/10 hover:bg-slate-800/80'}"
	>
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			{#if isActive}
				<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
				<path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				<circle cx="12" cy="12" r="2" fill="currentColor" class="animate-pulse" />
			{:else}
				<path d="M20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" stroke="currentColor" stroke-width="1.5" />
				<path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			{/if}
		</svg>

		{#if isActive}
			<span
				class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-0.5 text-[9px] font-bold text-slate-900"
			>
				{selectedMinutes}
			</span>
		{/if}
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