<script lang="ts">
	import { Howl } from 'howler';
	import { untrack } from 'svelte';

	interface Props {
		audioUrl: string;
		volume?: number;
		isPlaying?: boolean; // 1. Add isPlaying to your props definition
		onPlayStateChange?: (isPlaying: boolean) => void;
		onFinished?: () => void;
	}

	// 2. Turn isPlaying into a bindable property
	let {
		audioUrl,
		volume = $bindable(0.7),
		isPlaying = $bindable(false),
		onPlayStateChange = () => {},
		onFinished = () => {}
	}: Props = $props();

	let storyHowl: Howl | null = null;
	let currentTime = $state(0);
	let duration = $state(0);
	let isLoading = $state(false);

	let currentlyLoadedUrl = '';

	// Initialize story audio
	function initStory(shouldAutoPlay = false) {
		if (!audioUrl || audioUrl === currentlyLoadedUrl) return;

		if (storyHowl) {
			storyHowl.stop();
			storyHowl.unload();
			storyHowl = null;
		}

		isLoading = true;
		currentlyLoadedUrl = audioUrl;

		storyHowl = new Howl({
			src: [audioUrl],
			html5: true,
			volume: untrack(() => volume),
			onload: () => {
				duration = storyHowl?.duration() || 0;
				isLoading = false;

				// 3. Check either the explicit flag OR the parent's current state
				if (shouldAutoPlay || isPlaying) {
					storyHowl?.play();
				}
			},
			onplay: () => {
				isPlaying = true;
				onPlayStateChange(true);
				updateTime();
			},
			onpause: () => {
				isPlaying = false;
				onPlayStateChange(false);
			},
			onstop: () => {
				isPlaying = false;
				currentTime = 0;
				onPlayStateChange(false);
			},
			onend: () => {
				// 4. CRITICAL: Don't forcefully wipe out parent state here if we are chaining tracks
				onPlayStateChange(false);
				onFinished();
			},
			onloaderror: () => {
				isLoading = false;
				isPlaying = false;
				currentlyLoadedUrl = '';
				console.error('Failed to load audio source link:', audioUrl);
			}
		});
	}

	function updateTime() {
		if (storyHowl && isPlaying) {
			currentTime = storyHowl.seek() || 0;
			requestAnimationFrame(updateTime);
		}
	}

	function togglePlay() {
		if (!storyHowl) {
			initStory(true);
			return;
		}
		if (isLoading) return;

		if (isPlaying) {
			storyHowl.pause();
		} else {
			storyHowl.play();
		}
	}

	function seekTo(seconds: number) {
		if (!storyHowl) return;
		storyHowl.seek(seconds);
		currentTime = seconds;
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Reactive Effect: ONLY runs when audioUrl changes explicitly
	$effect(() => {
		if (audioUrl) {
			// Look at the state right before the change happens
			const wasPlaying = untrack(() => isPlaying);
			initStory(wasPlaying);
		}
	});

	// Reactive Effect: Isolated entirely to volume mutations
	$effect(() => {
		if (storyHowl) {
			storyHowl.volume(volume);
		}
	});

	// Destruction Lifecycle Hook
	$effect(() => {
		return () => {
			if (storyHowl) {
				storyHowl.stop();
				storyHowl.unload();
			}
		};
	});
</script>

<div class="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
	<div class="mb-8 flex items-center justify-center">
		<button
			onclick={togglePlay}
			disabled={isLoading}
			class="group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-300 to-amber-400 text-slate-900 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
		>
			{#if isLoading}
				<svg class="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.3" />
					<path
						d="M12 2a10 10 0 0 1 10 10"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			{:else if isPlaying}
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<rect x="6" y="4" width="4" height="16" fill="currentColor" rx="1" />
					<rect x="14" y="4" width="4" height="16" fill="currentColor" rx="1" />
				</svg>
			{:else}
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M8 5v14l11-7z" fill="currentColor" />
				</svg>
			{/if}
		</button>
	</div>

	<div class="mb-6">
		<div class="mb-3 flex justify-between text-sm text-slate-300">
			<span>{formatTime(currentTime)}</span>
			<span>{formatTime(duration)}</span>
		</div>
		<div
			class="group h-3 w-full cursor-pointer rounded-full bg-slate-700/50 transition-all hover:h-4"
			role="slider"
			tabindex="0"
			aria-label="Audio progress bar"
			aria-valuemin="0"
			aria-valuemax={duration}
			aria-valuenow={currentTime}
			onclick={(e) => {
				if (!storyHowl || duration === 0) return;
				const rect = e.currentTarget.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const percentage = x / rect.width;
				seekTo(percentage * duration);
			}}
			onkeydown={(e) => {
				if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
					e.preventDefault();
					const step = duration * 0.05;
					const newTime =
						e.key === 'ArrowLeft'
							? Math.max(0, currentTime - step)
							: Math.min(duration, currentTime + step);
					seekTo(newTime);
				}
			}}
		>
			<div
				class="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/25"
				style="width: {duration > 0 ? (currentTime / duration) * 100 : 0}%"
			></div>
		</div>
	</div>

	<div class="flex items-center gap-4">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
		</svg>
		<input
			type="range"
			min="0"
			max="1"
			step="0.05"
			bind:value={volume}
			class="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-700 transition-all hover:bg-slate-600"
		/>
		<span class="text-sm text-slate-300">{Math.round(volume * 100)}%</span>
	</div>
</div>
