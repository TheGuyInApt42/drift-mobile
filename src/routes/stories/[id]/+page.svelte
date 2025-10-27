<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Howl } from 'howler';

	// Import components
	import StoryPlayer from '$lib/components/StoryPlayer.svelte';
	import SleepTimer from '$lib/components/SleepTimer.svelte';
	import AmbientToggle from '$lib/components/AmbientToggle.svelte';
	import TextModeToggle from '$lib/components/TextModeToggle.svelte';
	import StoryText from '$lib/components/StoryText.svelte';
	import AmbientAnimations from '$lib/components/AmbientAnimations.svelte';
	import NotificationToast from '$lib/components/NotificationToast.svelte';

	// Import story images
	import noah from '$lib/assets/noah-hero.png';
	import david from '$lib/assets/david.png';
	import samaritan from '$lib/assets/samaritan.png';
	import jonah from '$lib/assets/jonah.png';

	// Story data
	const stories = {
		'noah-rainbow-promise': {
			id: 'noah-rainbow-promise',
			title: 'Noah and the Rainbow Promise',
			subtitle: 'A gentle 25‑minute bedtime drama',
			durationMin: 25,
			tags: ['Calm', 'Faith & Light'],
			cover: noah,
			audioUrl:
				'https://sxoswsjfcnvmrzgtfmer.supabase.co/storage/v1/object/sign/audio/stories/noah-and-the-ark/Noah%20Scenes%201+2.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDBlODUwZC05YjY1LTQyOTQtYjgxMC1kMTgwZTA1MDM5MzgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby9zdG9yaWVzL25vYWgtYW5kLXRoZS1hcmsvTm9haCBTY2VuZXMgMSsyLm1wMyIsImlhdCI6MTc2MDkwNTcxMCwiZXhwIjoxNzYxNTEwNTEwfQ.pVJfMyo_O9uRknLSJLs-03cv_FJsBiZJWaXhb297hrc'
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
			audioUrl: '/audio/stories/jonah.mp3'
		}
	};

	let currentStory = $derived(() => {
		const storyId = page.params.id;
		return storyId ? stories[storyId as keyof typeof stories] : null;
	});

	// Player state
	let volume = $state(0.7);
	let isPlaying = $state(false);
	let sleepTimerActive = $state(false);
	let sleepTimerMinutes = $state(0);
	let ambientEnabled = $state(false);
	let isTextMode = $state(false);
	let ambientAnimationType = $state<'rain' | 'candle' | 'none'>('rain');

	// Sleep timer
	let sleepTimerInterval: ReturnType<typeof setTimeout> | null = null;

	// Notifications
	let notifications = $state<
		Array<{ id: number; message: string; type: 'success' | 'info' | 'warning' | 'error' }>
	>([]);
	let notificationId = 0;

	// Event handlers for components
	function handlePlayStateChange(playing: boolean) {
		isPlaying = playing;
	}

	function handleSleepTimerSet(minutes: number) {
		sleepTimerActive = true;
		sleepTimerMinutes = minutes;

		// Clear existing timer
		if (sleepTimerInterval) {
			clearTimeout(sleepTimerInterval);
		}

		// Set new timer
		sleepTimerInterval = setTimeout(
			() => {
				// Pause audio and show notification
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

	// Update animation type when ambient toggle changes
	$effect(() => {
		ambientAnimationType = ambientEnabled ? 'rain' : 'none';
	});

	function handleTextModeToggle(enabled: boolean) {
		isTextMode = enabled;
		if (enabled) {
			// Pause audio when switching to text mode
			isPlaying = false;
		}
	}

	function addNotification(message: string, type: 'success' | 'info' | 'warning' | 'error') {
		const id = ++notificationId;
		notifications = [...notifications, { id, message, type }];
	}

	function removeNotification(id: number) {
		notifications = notifications.filter((n) => n.id !== id);
	}

	// Redirect to home if story not found
	$effect(() => {
		const story = currentStory();
		if (!story) {
			goto('/');
		}
	});

	onMount(() => {
		return () => {
			// Cleanup sleep timer
			if (sleepTimerInterval) {
				clearTimeout(sleepTimerInterval);
			}
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
						{#each currentStory()?.tags || [] as tag}
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
					<AmbientToggle ambientUrl="/audio/ambience/rain.mp3" bind:isEnabled={ambientEnabled} />
					<TextModeToggle bind:isTextMode />
				</div>

				<!-- Story Content -->
				{#if isTextMode}
					<StoryText storyTitle={currentStory()?.title || ''} />
				{:else}
					<StoryPlayer
						audioUrl={currentStory()?.audioUrl || ''}
						bind:volume
						onPlayStateChange={handlePlayStateChange}
					/>
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
