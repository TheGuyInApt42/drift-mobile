<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	import StoryPlayer from '$lib/components/StoryPlayer.svelte';
	import AmbientToggle from '$lib/components/AmbientToggle.svelte';
	import AmbientAnimations from '$lib/components/AmbientAnimations.svelte';
	import NotificationToast from '$lib/components/NotificationToast.svelte';
	import { ambient } from '$lib/state/ambient.svelte';
	import { progressStore } from '$lib/stores/progress.svelte';

	interface Story {
		id: string;
		title: string;
		subtitle: string | null;
		duration_min: number;
		cover_url: string;
	}

	// Single row now — the whole story is one file. Kept as an array in the
	// data shape for now since that's what your API already returns; only
	// ever has one element post-pivot.
	interface Track {
		id: number;
		story_id: string;
		track_order: number;
		title: string;
		audio_url: string;
		duration_seconds: number;
	}

	// NEW — timestamp offsets within the single audio file. Needs a
	// `chapters` array added to your +page.ts load function and the
	// /stories/:id Worker route (query story_chapters by story_id, ordered
	// by chapter_order) — I don't have either of those files, so this page
	// assumes `data.chapters` exists but you'll need to wire the fetch.
	interface Chapter {
		id: number;
		story_id: string;
		chapter_order: number;
		title: string;
		start_seconds: number;
	}

	let { data } = $props();
	let story: Story = $derived(data.story);
	let tracks: Track[] = $derived(data.tracks);
	let chapters: Chapter[] = $derived(data.chapters ?? []);
	let tags: string[] = $derived(data.tags);

	let playerCurrentTime = $state(0);
	let seekToTime = $state<number | null>(null);
	let playerRef: { seekTo: (seconds: number) => void } | undefined;

	function handleTimeUpdate(time: number) {
		playerCurrentTime = time;
	}

	// ── Progress tracking ──────────────────────────────────────────────
	// Position is just the player's current time now — no more summing
	// "completed tracks" durations, since there's only ever one track.
	let saveInterval: ReturnType<typeof setInterval> | null = null;

	function totalDurationSeconds(): number {
		return tracks[0]?.duration_seconds ?? 0;
	}

	function saveProgress() {
		if (!story) return;
		progressStore.save({
			storyId: story.id,
			title: story.title,
			coverUrl: story.cover_url,
			positionSeconds: playerCurrentTime,
			durationSeconds: totalDurationSeconds(),
			lastListened: Date.now()
		});
	}

	function startSaving() {
		if (saveInterval) return;
		saveInterval = setInterval(saveProgress, 5000);
	}

	function stopSaving() {
		if (saveInterval) {
			clearInterval(saveInterval);
			saveInterval = null;
		}
	}

	function handlePlayStateChange(playing: boolean) {
		isPlaying = playing;
		if (playing) {
			startSaving();
		} else {
			stopSaving();
			saveProgress();
		}
	}

	// Player state
	let isPlaying = $state(false);

	let totalStoryMinutes = $derived(
		tracks[0]?.duration_seconds
			? Math.ceil(tracks[0].duration_seconds / 60)
			: story.duration_min
	);

	let audioUrl = $derived(tracks[0]?.audio_url ?? '');

	// Which chapter is "active" is now a lookup against playback time,
	// not a variable that has to stay in sync with which file is loaded.
	let activeChapterIndex = $derived.by(() => {
		if (!chapters.length) return -1;
		let idx = 0;
		for (let i = 0; i < chapters.length; i++) {
			if (playerCurrentTime >= chapters[i].start_seconds) idx = i;
		}
		return idx;
	});

	$effect(() => {
		if (!story) goto('/');
	});

	function handleStoryFinished() {
		isPlaying = false;
		progressStore.clear(story.id);
		addNotification('Story completed', 'success');
	}

	type Notification = {
		id: number;
		message: string;
		type: 'success' | 'info' | 'warning' | 'error';
	};

	let notifications: Notification[] = $state([]);
	let notificationId = 0;

	// Chapter click = instant seek within the already-loaded file, not a
	// reload. No gap, no "which track is this" bookkeeping.
	function selectChapter(idx: number) {
		const chapter = chapters[idx];
		if (!chapter || !playerRef) return;
		playerRef.seekTo(chapter.start_seconds);
		if (!isPlaying) isPlaying = true;
		addNotification(`Playing: ${chapter.title}`, 'info');
	}

	function addNotification(message: string, type: 'success' | 'info' | 'warning' | 'error') {
		const id = ++notificationId;
		notifications.push({ id, message, type });
	}

	function removeNotification(id: number) {
		notifications = notifications.filter((n) => n.id !== id);
	}

	onMount(() => {
		(async () => {
			if (!progressStore.initialized) await progressStore.load();

			const saved = progressStore.get(story.id);
			if (!saved || saved.positionSeconds < 5) return;

			// Single file now — resume is just the saved position directly,
			// no more "which track does this offset fall into" loop.
			seekToTime = saved.positionSeconds;
		})();

		return () => {
			stopSaving();
		};
	});
</script>

{#if story}
	<div
		class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
	>
		<header class="flex items-center px-6 py-4 sm:px-10">
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
		</header>

		<main class="relative px-6 pb-8 sm:px-10">
			<AmbientAnimations
				animationType={ambient.enabled ? 'rain' : 'none'}
				isActive={ambient.enabled}
			/>

			<div class="mx-auto max-w-4xl">
				<section class="mb-6">
					<div
						class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md"
					>
						<img
							src={story.cover_url}
							alt={story.title}
							class="h-64 w-full object-cover opacity-90 sm:h-80"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"
						></div>

						<div class="absolute inset-x-0 bottom-0 p-5 sm:p-6">
							<h1 class="text-2xl font-semibold sm:text-3xl">{story.title}</h1>
							{#if story.subtitle}
								<p class="mt-1 text-sm text-slate-300">{story.subtitle}</p>
							{/if}

							<div class="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-300/80">
								<span class="inline-flex items-center gap-1">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
										<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" />
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
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<circle cx="12" cy="12" r="3" fill="currentColor" />
										</svg>
										{tag}
									</span>
								{/each}
							</div>
						</div>
					</div>
				</section>

				<div class="mb-6 flex items-center gap-2">
					<AmbientToggle />
				</div>

				<StoryPlayer
					bind:this={playerRef}
					{audioUrl}
					bind:isPlaying
					onPlayStateChange={handlePlayStateChange}
					onFinished={handleStoryFinished}
					onTimeUpdate={handleTimeUpdate}
					{seekToTime}
					trackTitle={story.title}
					artworkUrl={story.cover_url}
				/>

				{#if chapters.length > 1}
					<div
						class="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 backdrop-blur-sm"
					>
						<h3 class="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
							Chapters
						</h3>
						<ol class="space-y-2">
							{#each chapters as chapter, idx (chapter.id)}
								<li>
									<button
										onclick={() => selectChapter(idx)}
										class="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm transition-all
										{idx === activeChapterIndex
											? 'border border-amber-400/20 bg-amber-400/10 font-medium text-amber-300'
											: 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}"
										aria-current={idx === activeChapterIndex ? 'true' : undefined}
									>
										<span class="truncate">{idx + 1}. {chapter.title}</span>
										{#if idx === activeChapterIndex && isPlaying}
											<span class="flex h-2 w-2 animate-ping rounded-full bg-amber-400"></span>
										{/if}
									</button>
								</li>
							{/each}
						</ol>
					</div>
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