<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Import components
	import StoryPlayer from '$lib/components/StoryPlayer.svelte';
	import SleepTimer from '$lib/components/SleepTimer.svelte';
	import AmbientToggle from '$lib/components/AmbientToggle.svelte';
	import TextModeToggle from '$lib/components/TextModeToggle.svelte';
	import StoryText from '$lib/components/StoryText.svelte';
	import AmbientAnimations from '$lib/components/AmbientAnimations.svelte';
	import NotificationToast from '$lib/components/NotificationToast.svelte';
	import { ambient } from '$lib/state/ambient.svelte';

	// Import story images
	import noah from '$lib/assets/noah-hero.png';
	import david from '$lib/assets/david.png';
	import samaritan from '$lib/assets/samaritan.png';
	import jonah from '$lib/assets/jonah.png';

	// Story data with Jonah modified to accept multiple scenes
	const stories = {
		'noah-rainbow-promise': {
			id: 'noah-rainbow-promise',
			title: 'Noah and the Rainbow Promise',
			subtitle: 'A gentle 25‑minute bedtime drama',
			durationMin: 25,
			tags: ['Calm', 'Faith & Light'],
			cover: noah,
			audioUrl:
				'https://pub-4236d05ff21041bf8f87267716f5fa66.r2.dev/stories/noah/Noah%20Scenes%201%2B2.mp3'
		},
		'david-giant-shadow': {
			id: 'david-giant-shadow',
			title: "David and the Giant's Shadow",
			subtitle: 'A courageous tale of faith and determination',
			durationMin: 22,
			tags: ['Hopeful', 'Faith & Light'],
			cover: david,
			audioUrl: '/audio/stories/david.mp3'
		},
		'good-samaritan-road': {
			id: 'good-samaritan-road',
			title: 'The Road of Kindness',
			subtitle: 'A story of compassion and mercy',
			durationMin: 18,
			tags: ['Kindness Tales'],
			cover: samaritan,
			audioUrl: '/audio/stories/samaritan.mp3'
		},
		'jonah-beneath-blue': {
			id: 'jonah-beneath-blue',
			title: 'Jonah: Beneath the Deep Blue',
			subtitle: 'A journey of redemption and grace',
			durationMin: 24,
			tags: ['Reflective', 'Faith & Light'],
			cover: jonah,
			// Array of tracks for continuous play
			audioUrl: [
				{
					title: 'Act I: The Dust of Gath-Hepher',
					url: 'https://pub-4236d05ff21041bf8f87267716f5fa66.r2.dev/stories/jonah/01_Scene%201.mp3'
				},
				{
					title: 'Act I: The Flight to Joppa',
					url: 'https://pub-4236d05ff21041bf8f87267716f5fa66.r2.dev/stories/jonah/02_Scene%202.mp3'
				},
				{
					title: 'Act II: The Gathering Storm',
					url: 'https://pub-4236d05ff21041bf8f87267716f5fa66.r2.dev/stories/jonah/03_Scene%203.mp3'
				}
			]
		}
	};

	let currentStory = $derived(() => {
		const storyId = page.params.id;
		return storyId ? stories[storyId as keyof typeof stories] : null;
	});

	// Player state
	let currentTrackIndex = $state(0);
	let volume = $state(0.7);
	let isPlaying = $state(false);
	let sleepTimerActive = $state(false);
	let sleepTimerMinutes = $state(0);
	let isTextMode = $state(false);
	let ambientAnimationType = $state<'rain' | 'candle' | 'none'>('rain');

	// 3. Extracting the real URL string reactively
	let activeAudioUrl = $derived(() => {
		const story = currentStory();
		if (!story) return '';

		if (Array.isArray(story.audioUrl)) {
			return story.audioUrl[currentTrackIndex]?.url || '';
		}
		return story.audioUrl;
	});

	// Reset indices on navigation changes
	$effect(() => {
		currentStory();
		currentTrackIndex = 0;
	});

	// 4. Sequential track playlist routing
	function handleTrackFinished() {
		const story = currentStory();
		if (story && Array.isArray(story.audioUrl)) {
			if (currentTrackIndex < story.audioUrl.length - 1) {
				currentTrackIndex++;
				isPlaying = true;
				addNotification(`Playing next chapter: ${story.audioUrl[currentTrackIndex].title}`, 'info');
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

	// Notifications state
	let notifications = $state<
		Array<{ id: number; message: string; type: 'success' | 'info' | 'warning' | 'error' }>
	>([]);
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
		ambientAnimationType = ambient.enabled ? 'rain' : 'none';
	});

	function handleTextModeToggle(enabled: boolean) {
		isTextMode = enabled;
		if (enabled) isPlaying = false;
	}

	function addNotification(message: string, type: 'success' | 'info' | 'warning' | 'error') {
		const id = ++notificationId;
		notifications.push({ id, message, type });
	}

	function removeNotification(id: number) {
		notifications = notifications.filter((n) => n.id !== id);
	}

	$effect(() => {
		if (!currentStory()) goto('/');
	});

	onMount(() => {
		return () => {
			if (sleepTimerInterval) clearTimeout(sleepTimerInterval);
		};
	});
</script>

{#if currentStory()}
	<div
		class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
	>
		<!-- Header -->
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

		<!-- Story Content -->
		<main class="relative px-6 py-8 sm:px-10">
			<!-- Ambient Animations -->
			<AmbientAnimations animationType="rain" isActive={true} />

			<div class="mx-auto max-w-4xl">
				<!-- Story Image -->
				<div class="mb-8">
					<img
						src={currentStory()?.cover}
						alt={currentStory()?.title}
						class="h-64 w-full rounded-2xl object-cover sm:h-80"
					/>
				</div>

				<!-- Story Info -->
				<div class="mb-8">
					<h1 class="mb-2 text-3xl font-semibold sm:text-4xl">{currentStory()?.title}</h1>
					{#if currentStory()?.subtitle}
						<p class="mb-4 text-slate-300">{currentStory()?.subtitle}</p>
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
							{currentStory()?.durationMin} min
						</span>
						{#each currentStory()?.tags || [] as tag, index (index)}
							<span class="inline-flex items-center gap-1">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<circle cx="12" cy="12" r="3" fill="currentColor" />
								</svg>
								{tag}
							</span>
						{/each}
					</div>
				</div>

				<!-- Control Panel -->
				<div class="mb-8 flex flex-wrap items-center gap-3">
					<SleepTimer onTimerSet={handleSleepTimerSet} onTimerClear={handleSleepTimerClear} />
					<AmbientToggle />
					<TextModeToggle bind:isTextMode />
				</div>

				<!-- Story Content -->
				{#if isTextMode}
					<StoryText storyTitle={currentStory()?.title || ''} />
				{:else}
					<StoryPlayer
						audioUrl={activeAudioUrl()}
						bind:volume
						bind:isPlaying
						onPlayStateChange={handlePlayStateChange}
						onFinished={handleTrackFinished}
					/>

					{#if Array.isArray(currentStory()?.audioUrl)}
						<div
							class="mt-6 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-5 backdrop-blur-sm"
						>
							<h3 class="mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
								Chapters Playlist
							</h3>
							<ol class="space-y-2">
								{#each currentStory()?.audioUrl || [] as track, idx}
									<li
										class="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all {idx ===
										currentTrackIndex
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

		<!-- Notifications -->
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
