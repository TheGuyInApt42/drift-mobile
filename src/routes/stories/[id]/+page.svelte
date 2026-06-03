<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import StoryPlayer from '$lib/components/StoryPlayer.svelte';
	import SleepTimer from '$lib/components/SleepTimer.svelte';
	import AmbientToggle from '$lib/components/AmbientToggle.svelte';
	import TextModeToggle from '$lib/components/TextModeToggle.svelte';
	import StoryText from '$lib/components/StoryText.svelte';
	import AmbientAnimations from '$lib/components/AmbientAnimations.svelte';
	import NotificationToast from '$lib/components/NotificationToast.svelte';
	import { ambient } from '$lib/state/ambient.svelte';

	interface Story {
		id: string;
		title: string;
		subtitle: string | null;
		duration_min: number;
		cover_url: string;
	}

	interface Track {
		id: number;
		story_id: string;
		track_order: number;
		title: string;
		audio_url: string;
		duration_seconds: number;
	}

	let { data } = $props();
	let story: Story = $derived(data.story);
	let tracks: Track[] = $derived(data.tracks);
	let tags: string[] = $derived(data.tags);

	// Player state
	let currentTrackIndex = $state(0);
	let volume = $state(0.7);
	let isPlaying = $state(false);
	let sleepTimerActive = $state(false);
	let sleepTimerMinutes = $state(0);
	let isTextMode = $state(false);

	// Derived values — plain expressions, not functions
	let totalStoryMinutes = $derived(
		tracks.length > 0
			? Math.ceil(tracks.reduce((acc, t) => acc + (t.duration_seconds ?? 0), 0) / 60)
			: story.duration_min
	);

	let activeAudioUrl = $derived(
		tracks.length > 0 ? (tracks[currentTrackIndex]?.audio_url ?? '') : ''
	);

	// Reset track index when story changes
	$effect(() => {
		data.story; // track dependency
		currentTrackIndex = 0;
	});

	$effect(() => {
		if (!story) goto('/');
	});

	$effect(() => {
		// ambientAnimationType removed — AmbientAnimations can read ambient.enabled directly
		// or pass it as a prop if needed
	});

	function handleTrackFinished() {
		if (tracks.length > 1) {
			if (currentTrackIndex < tracks.length - 1) {
				currentTrackIndex++;
				isPlaying = true;
				addNotification(`Playing: ${tracks[currentTrackIndex].title}`, 'info');
			} else {
				isPlaying = false;
				currentTrackIndex = 0;
				addNotification('Story completed', 'success');
			}
		} else {
			isPlaying = false;
		}
	}

	// Sleep timer
	let sleepTimerInterval: ReturnType<typeof setTimeout> | null = null;

	type Notification = {
		id: number;
		message: string;
		type: 'success' | 'info' | 'warning' | 'error';
	};

	let notifications: Notification[] = $state([]);

	let notificationId = 0;

	function handlePlayStateChange(playing: boolean) {
		isPlaying = playing;
	}

	function handleSleepTimerSet(minutes: number) {
		sleepTimerActive = true;
		sleepTimerMinutes = minutes;
		if (sleepTimerInterval) clearTimeout(sleepTimerInterval);
		sleepTimerInterval = setTimeout(
			() => {
				isPlaying = false;
				sleepTimerActive = false;
				sleepTimerMinutes = 0;
				addNotification('Sleep timer activated - audio paused', 'info');
			},
			minutes * 60 * 1000
		);
	}

	function handleSleepTimerClear() {
		sleepTimerActive = false;
		sleepTimerMinutes = 0;
		if (sleepTimerInterval) {
			clearTimeout(sleepTimerInterval);
			sleepTimerInterval = null;
		}
	}

	$effect(() => {
		if (isTextMode) isPlaying = false;
	});

	function addNotification(message: string, type: 'success' | 'info' | 'warning' | 'error') {
		const id = ++notificationId;
		notifications.push({ id, message, type });
	}

	function removeNotification(id: number) {
		notifications = notifications.filter((n) => n.id !== id);
	}

	onMount(() => {
		return () => {
			if (sleepTimerInterval) clearTimeout(sleepTimerInterval);
		};
	});
</script>

{#if story}
	<div
		class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
	>
		<header class="flex items-center justify-between px-6 py-4 sm:px-10">
			<button
				onclick={() => goto('/')}
				class="inline-flex items-center gap-2 text-slate-300 transition hover:text-white"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M19 12H5M12 19l-7-7 7-7"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				Back
			</button>
			<div class="flex items-center gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-300 to-rose-300"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M12 2v3m0 14v3M7 7h10l1 4v5a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V11l1-4Z"
							stroke="currentColor"
							stroke-width="1.5"
						/>
						<circle cx="12" cy="12" r="2.5" fill="currentColor" />
					</svg>
				</div>
				<span class="font-semibold">Drift</span>
			</div>
		</header>

		<main class="relative px-6 py-8 sm:px-10">
			<AmbientAnimations
				animationType={ambient.enabled ? 'rain' : 'none'}
				isActive={ambient.enabled}
			/>

			<div class="mx-auto max-w-4xl">
				<div class="mb-8">
					<img
						src={story.cover_url}
						alt={story.title}
						class="h-64 w-full rounded-2xl object-cover sm:h-80"
					/>
				</div>

				<div class="mb-8">
					<h1 class="mb-2 text-3xl font-semibold sm:text-4xl">{story.title}</h1>
					{#if story.subtitle}
						<p class="mb-4 text-slate-300">{story.subtitle}</p>
					{/if}

					<div class="flex flex-wrap items-center gap-4 text-slate-300">
						<span class="inline-flex items-center gap-1">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path
									d="M12 8v5l3 2"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
								/>
							</svg>
							{totalStoryMinutes} min
						</span>
						{#each tags as tag (tag)}
							<span class="inline-flex items-center gap-1">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<circle cx="12" cy="12" r="3" fill="currentColor" />
								</svg>
								{tag}
							</span>
						{/each}
					</div>
				</div>

				<div class="mb-8 flex flex-wrap items-center gap-3">
					<SleepTimer onTimerSet={handleSleepTimerSet} onTimerClear={handleSleepTimerClear} />
					<AmbientToggle />
					<TextModeToggle bind:isTextMode />
				</div>

				{#if isTextMode}
					<StoryText storyTitle={story.title} />
				{:else}
					<StoryPlayer
						audioUrl={activeAudioUrl}
						bind:volume
						bind:isPlaying
						onPlayStateChange={handlePlayStateChange}
						onFinished={handleTrackFinished}
					/>

					{#if tracks.length > 1}
						<div
							class="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 backdrop-blur-sm"
						>
							<h3 class="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
								Chapters Playlist
							</h3>
							<ol class="space-y-2">
								{#each tracks as track, idx (track.id)}
									<li
										class="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all
										{idx === currentTrackIndex
											? 'border border-amber-400/20 bg-amber-400/10 font-medium text-amber-300'
											: 'text-slate-400 hover:bg-slate-800/30'}"
									>
										<span class="truncate">{idx + 1}. {track.title}</span>
										{#if idx === currentTrackIndex && isPlaying}
											<span class="flex h-2 w-2 animate-ping rounded-full bg-amber-400"></span>
										{/if}
									</li>
								{/each}
							</ol>
						</div>
					{/if}
				{/if}
			</div>
		</main>

		{#each notifications as notification (notification.id)}
			<NotificationToast
				message={notification.message}
				type={notification.type}
				onClose={() => removeNotification(notification.id)}
			/>
		{/each}
	</div>
{:else}
	<div
		class="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
	>
		<div class="text-center">
			<h1 class="mb-2 text-2xl font-semibold">Story not found</h1>
			<p class="mb-4 text-slate-300">The story you're looking for doesn't exist.</p>
			<button
				onclick={() => goto('/')}
				class="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2 font-medium text-slate-900"
			>
				Go Home
			</button>
		</div>
	</div>
{/if}
