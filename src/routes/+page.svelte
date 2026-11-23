<!--
	Drift Mobile - Home Page Component

	Minimal, image-led layout:
	- Compact header (mark + icon-only ambient toggle, no text hero)
	- Featured story card carries the "hero" moment via cover art
	- Continue Listening
	- Library grid
	- Bottom dock (rendered from +layout.svelte)

	Technical Stack:
	- Svelte 5 with runes ($state, $derived) for reactive state management
	- Howler.js for cross-platform audio playback
	- Tailwind CSS for styling
	- Animated CSS starfield background for visual appeal
-->

<script lang="ts">
	import { onMount } from 'svelte';
	import { Howl } from 'howler';
	import { progressStore } from '$lib/stores/progress.svelte';
	import { invalidateAll } from '$app/navigation';

	// ============================================================================
	// Type Definitions
	// ============================================================================
	type Story = {
		id: string;
		title: string;
		subtitle?: string;
		duration_min: number;
		tags: string[];
		cover_url: string;
		preview_url?: string;
	};

	let { data } = $props();
	let stories: Story[] = $derived(data.stories);
	let featured: Story | null = $derived(data.featured);
	let loadFailed = $derived(data.loadFailed ?? false);
	let retrying = $state(false);
	async function retryLoad() {
		retrying = true;
		try {
			await invalidateAll();
		} finally {
			retrying = false;
		}
	}
	const latest = $derived(progressStore.latest);
	const progressPct = $derived(
		latest && latest.durationSeconds > 0
			? Math.round((latest.positionSeconds / latest.durationSeconds) * 100)
			: 0
	);

	// ============================================================================
	// State Management (Svelte 5 Runes)
	// ============================================================================
	let previewHowl: Howl | null = null;

	/**
	 * Tracks if user has performed a gesture to enable audio playback
	 * Browsers require a user interaction before allowing audio to play
	 */
	let userGesture = $state(false);

	// ============================================================================
	// Audio Functions
	// ============================================================================
	function playPreview(story: Story) {
		if (!story.preview_url) return;
		userGesture = true;
		previewHowl?.stop();
		previewHowl?.unload();
		previewHowl = new Howl({ src: [story.preview_url], volume: 0.9, html5: true });
		previewHowl.play();
	}

	function stopPreview() {
		previewHowl?.stop();
	}

	// ============================================================================
	// Lifecycle Hooks
	// ============================================================================
	onMount(() => {
		return () => {
			stopPreview();
		};
	});
</script>

<div
	class="relative min-h-[100svh] overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
>
	<!-- Animated starfield background -->
	<div class="pointer-events-none absolute inset-0 opacity-60">
		<div class="stars"></div>
		<div class="stars2"></div>
		<div class="stars3"></div>
	</div>

	<!-- ============================================================================
		 Header
		 ============================================================================
		 Just the mark. Ambient is a story-listening feature now — it lives on
		 the story player page, not here.
	-->
	<header class="relative z-10 flex items-center px-6 py-4 sm:px-10">
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-300 to-rose-300 shadow-lg shadow-amber-500/20"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M12 2v3m0 14v3M7 7h10l1 4v5a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V11l1-4Z"
						stroke="currentColor"
						stroke-width="1.5"
					/>
					<circle cx="12" cy="12" r="2.5" fill="currentColor" />
				</svg>
			</div>
			<span class="text-lg font-semibold tracking-wide">Drift</span>
		</div>
	</header>

	<main class="relative z-10 px-6 sm:px-10">
		{#if loadFailed}
			<section
				role="alert"
				class="mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-center backdrop-blur-md"
			>
				<h2 class="mb-1 text-lg font-semibold">
					{typeof navigator !== 'undefined' && navigator.onLine === false
						? "You're offline"
						: "Can't reach stories right now"}
				</h2>
				<p class="mb-4 text-sm text-slate-300">Check your connection and try again.</p>
				<button
					onclick={retryLoad}
					disabled={retrying}
					class="rounded-xl bg-amber-300 px-4 py-2 font-medium text-slate-900 disabled:opacity-60"
				>
					{retrying ? 'Trying…' : 'Try again'}
				</button>
			</section>
		{/if}
		<!-- ============================================================================
			 Featured Story
			 ============================================================================
			 The cover art carries the hero moment now — no separate headline block.
			 Title/subtitle/actions sit directly on the image.
		-->
		{#if featured}
			<section class="pt-2 pb-2">
				<article
					class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md"
				>
					<img
						src={featured.cover_url}
						alt={featured.title}
						class="h-80 w-full object-cover opacity-90 sm:h-[26rem]"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>

					<div class="absolute inset-x-0 bottom-0 p-5 sm:p-6">
						<h1 class="text-2xl font-semibold sm:text-3xl">{featured.title}</h1>
						{#if featured.subtitle}
							<p class="mt-1 text-slate-300">{featured.subtitle}</p>
						{/if}

						<div class="mt-2 flex items-center gap-3 text-sm text-slate-300/80">
							<span class="inline-flex items-center gap-1">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
									><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" /><path
										d="M12 8v5l3 2"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
									/></svg
								>
								{featured.duration_min} min
							</span>
							{#each featured.tags as t (t)}
								<span>{t}</span>
							{/each}
						</div>

						<div class="mt-4 flex flex-wrap items-center gap-3">
							<a
								href="/stories/{featured.id}"
								class="inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-medium text-slate-900 shadow-lg shadow-amber-500/20 transition hover:shadow-amber-500/30"
							>
								Start Listening
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
									<path
										d="M5 12h14M13 5l7 7-7 7"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</a>
							{#if featured.preview_url}
								<button
									onclick={() => playPreview(featured)}
									onmouseenter={() => userGesture && playPreview(featured)}
									onmouseleave={stopPreview}
									class="inline-flex items-center gap-2 rounded-2xl bg-slate-900/60 px-5 py-3 ring-1 ring-white/10 backdrop-blur-md transition hover:bg-slate-900/80"
								>
									Preview
								</button>
							{/if}
						</div>
					</div>
				</article>
			</section>
		{/if}

		<!-- ============================================================================
			 Continue Listening
			 ============================================================================ -->
		{#if progressStore.initialized && latest}
			<section class="mt-8">
				<h3 class="section-heading">Continue Listening</h3>
				<div class="relative overflow-hidden rounded-2xl bg-slate-900/50 ring-1 ring-white/5">
					<div class="flex items-center gap-4 p-4 sm:p-6">
						<div class="h-14 w-14 overflow-hidden rounded-xl ring-1 ring-white/10">
							<img src={latest.coverUrl} alt={latest.title} class="h-full w-full object-cover" />
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-sm text-slate-300">{latest.title}</p>
							<div class="mt-1 h-2 w-full rounded-full bg-slate-700/80">
								<div
									class="h-2 rounded-full bg-amber-300 transition-[width] duration-300"
									style="width: {progressPct}%"
								></div>
							</div>
							<p class="mt-1 text-xs text-slate-500">{progressPct}% complete</p>
						</div>
						<a
							href="/stories/{latest.storyId}"
							class="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2 font-medium text-slate-900 shadow transition hover:shadow-lg"
						>Resume</a>
					</div>
				</div>
			</section>
		{/if}

		<!-- ============================================================================
			 Library
			 ============================================================================ -->
		<section class="mt-8">
			<h3 class="section-heading">Library</h3>
			<div class="xs:grid-cols-2 grid gap-4 sm:gap-6 lg:grid-cols-4">
				{#each stories as story (story.id)}
					<a
						href={'/stories/' + story.id}
						class="group relative overflow-hidden rounded-2xl bg-slate-900/40 ring-1 ring-white/10 transition hover:ring-white/20"
					>
						<img
							src={story.cover_url}
							alt={story.title}
							class="h-52 w-full object-cover transition group-hover:scale-[1.02]"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
						<div class="absolute bottom-0 p-4">
							<h4 class="leading-tight font-semibold">{story.title}</h4>
							<div class="mt-1 flex items-center gap-3 text-sm text-slate-300/90">
								<span class="inline-flex items-center gap-1"
									><svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
										><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" /><path
											d="M12 8v5l3 2"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
										/></svg
									>{story.duration_min} min</span
								>
								{#each story.tags as tag (tag)}
									<span>{tag}</span>
								{/each}
							</div>
						</div>
						{#if story.preview_url}
							<button
								type="button"
								class="absolute top-3 right-3 rounded-full bg-slate-900/70 px-3 py-1.5 text-xs ring-1 ring-white/10 hover:bg-slate-900/90"
								onclick={() => playPreview(story)}
								onmouseenter={(e) => {
									e.stopPropagation();
									if (userGesture) playPreview(story);
								}}
								onmouseleave={(e) => {
									e.stopPropagation();
									stopPreview();
								}}
								aria-label={`Preview ${story.title}`}
							>
								Preview
							</button>
						{/if}
					</a>
				{/each}
			</div>
		</section>
	</main>
</div>

<style>
	@reference "tailwindcss";

	.stars,
	.stars2,
	.stars3 {
		position: absolute;
		inset: 0;
		background-repeat: repeat;
		background-size: 200px 200px;
		animation: animStar 80s linear infinite;
	}

	.stars {
		background-image:
			radial-gradient(2px 2px at 20px 30px, rgba(255, 255, 255, 0.6) 50%, transparent 52%),
			radial-gradient(1px 1px at 100px 150px, rgba(255, 255, 255, 0.4) 50%, transparent 52%),
			radial-gradient(1px 1px at 170px 80px, rgba(255, 255, 255, 0.5) 50%, transparent 52%);
	}
	.stars2 {
		background-image:
			radial-gradient(2px 2px at 50px 60px, rgba(255, 255, 255, 0.5) 50%, transparent 52%),
			radial-gradient(1px 1px at 120px 180px, rgba(255, 255, 255, 0.35) 50%, transparent 52%),
			radial-gradient(1px 1px at 190px 40px, rgba(255, 255, 255, 0.4) 50%, transparent 52%);
		animation-duration: 120s;
		opacity: 0.8;
	}

	.stars3 {
		background-image:
			radial-gradient(2px 2px at 80px 120px, rgba(255, 255, 255, 0.45) 50%, transparent 52%),
			radial-gradient(1px 1px at 140px 30px, rgba(255, 255, 255, 0.35) 50%, transparent 52%),
			radial-gradient(1px 1px at 40px 170px, rgba(255, 255, 255, 0.35) 50%, transparent 52%);
		animation-duration: 180s;
		opacity: 0.6;
	}

	@keyframes animStar {
		from {
			background-position: 0 0;
		}
		to {
			background-position: -10000px 5000px;
		}
	}

	.section-heading {
		@apply mb-3 text-lg font-semibold tracking-wide;
	}
</style>