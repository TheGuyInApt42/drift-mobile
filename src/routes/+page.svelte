<script lang="ts">
	import { onMount } from 'svelte';
	import { Howl } from 'howler';

	// Images
	import noah from '$lib/assets/noah-hero.png';
	import david from '$lib/assets/david.png';
	import samaritan from '$lib/assets/samaritan.png';
	import jonah from '$lib/assets/jonah.png';
	import continueImg from '$lib/assets/continue.png';

	// --- Mock data (replace with your CMS / Supabase) ---
	type Story = {
		id: string;
		title: string;
		subtitle?: string;
		durationMin: number;
		tags: string[];
		cover: string; // image url
		previewUrl?: string; // 10–15s snippet
	};

	const featured: Story = {
		id: 'noah-rainbow-promise',
		title: 'Noah and the Rainbow Promise',
		subtitle: 'A gentle 25‑minute bedtime drama',
		durationMin: 25,
		tags: ['Calm', 'Faith & Light'],
		cover: noah,
		previewUrl:
			'https://sxoswsjfcnvmrzgtfmer.supabase.co/storage/v1/object/sign/audio/stories/noah-and-the-ark/preview-15s.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84ZDBlODUwZC05YjY1LTQyOTQtYjgxMC1kMTgwZTA1MDM5MzgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhdWRpby9zdG9yaWVzL25vYWgtYW5kLXRoZS1hcmsvcHJldmlldy0xNXMubXAzIiwiaWF0IjoxNzYwNzM5ODU4LCJleHAiOjE3NjEzNDQ2NTh9.BU41zUoQrsB1Hs9XxA_1aeBL0ua1hwQ2VlysHipFVm0'
	};

	const library: Story[] = [
		featured,
		{
			id: 'david-giant-shadow',
			title: 'David and the Giant’s Shadow',
			durationMin: 22,
			tags: ['Hopeful', 'Faith & Light'],
			cover: david,
			previewUrl: '/audio/previews/david-12s.mp3'
		},
		{
			id: 'good-samaritan-road',
			title: 'The Road of Kindness',
			durationMin: 18,
			tags: ['Kindness Tales'],
			cover: samaritan,
			previewUrl: '/audio/previews/samaritan-10s.mp3'
		},
		{
			id: 'jonah-beneath-blue',
			title: 'Jonah: Beneath the Deep Blue',
			durationMin: 24,
			tags: ['Reflective', 'Faith & Light'],
			cover: jonah,
			previewUrl: '/audio/previews/jonah-12s.mp3'
		}
	];

	let ambientEnabled = $state(false);
	let ambientHowl: Howl | undefined = $state(undefined);
	let previewHowl: Howl | null = null;
	let userGesture = $state(false); // browsers require interaction before audio

	// Initialize ambient sound
	function initAmbient() {
		if (!ambientHowl) {
			ambientHowl = new Howl({
				src: ['/audio/ambience/rain.mp3'], // Replace with your MP3 file path
				loop: true,
				volume: 0.25,
				preload: true,
				html5: true
			});
		}
		return ambientHowl;
	}

	function toggleAmbient() {
		userGesture = true;
		const h = initAmbient();
		ambientEnabled = !ambientEnabled;
		if (ambientEnabled) {
			h.play();
			h.fade(0, 0.25, 600); // Fade in
		} else {
			h.fade(h.volume(), 0, 600); // Fade out
			setTimeout(() => h.pause(), 650);
		}
	}

	function stopAmbient() {
		ambientHowl?.stop();
		ambientEnabled = false;
	}

	function playPreview(story: Story) {
		if (!story.previewUrl) return;
		userGesture = true;
		previewHowl?.stop();
		previewHowl?.unload();
		previewHowl = new Howl({ src: [story.previewUrl], volume: 0.9, html5: true });
		previewHowl.play();
	}

	function stopPreview() {
		previewHowl?.stop();
	}

	onMount(() => {
		// Clean up on nav away
		return () => {
			stopPreview();
			stopAmbient();
		};
	});
</script>

<!-- Page container -->
<div
	class="relative min-h-[100svh] overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
>
	<!-- Animated starfield background -->
	<div class="pointer-events-none absolute inset-0 opacity-60">
		<div class="stars"></div>
		<div class="stars2"></div>
		<div class="stars3"></div>
	</div>

	<!-- Top nav -->
	<header class="relative z-10 flex items-center justify-between px-6 py-4 sm:px-10">
		<div class="flex items-center gap-3">
			<div
				class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-300 to-rose-300 shadow-lg shadow-amber-500/20"
			>
				<!-- Lantern icon -->
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

		<!-- Ambient toggle -->
		<button
			class="group inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-4 py-2 text-sm ring-1 ring-white/10 backdrop-blur-md transition hover:bg-slate-800/80"
			onclick={toggleAmbient}
			aria-pressed={ambientEnabled}
		>
			<span class="relative flex h-5 w-9 items-center rounded-full bg-slate-700">
				<span
					class="dot absolute h-4 w-4 rounded-full bg-amber-300 transition-transform"
					style:transform={ambientEnabled ? 'translateX(20px)' : 'translateX(2px)'}
				></span>
			</span>
			<span class="opacity-80 group-hover:opacity-100">Ambient {ambientEnabled ? 'On' : 'Off'}</span
			>
		</button>
	</header>

	<!-- Hero / featured -->
	<main class="relative z-10 px-6 sm:px-10">
		<section class="grid items-stretch gap-8 lg:grid-cols-2">
			<!-- Hero text -->
			<div class="flex flex-col justify-center py-6 sm:py-10">
				<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl/tight">
					Timeless stories, gently dramatized for restful nights
				</h1>
				<p class="mt-4 max-w-prose text-slate-300">
					Soft narration, subtle music, and natural ambience draw you into ancient tales, parables,
					and moral adventures—crafted for calm and wonder.
				</p>
				<div class="mt-6 flex flex-wrap items-center gap-3">
					<a
						href="/stories/{featured.id}"
						class="inline-flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-medium text-slate-900 shadow-lg shadow-amber-500/20 transition hover:shadow-amber-500/30"
					>
						Start Tonight
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
					<button
						onclick={() => playPreview(featured)}
						onmouseenter={() => userGesture && playPreview(featured)}
						onmouseleave={stopPreview}
						class="inline-flex items-center gap-2 rounded-2xl bg-slate-800/60 px-5 py-3 ring-1 ring-white/10 backdrop-blur-md transition hover:bg-slate-800/80"
					>
						Preview 15s
					</button>
				</div>

				<!-- Badges -->
				<div class="mt-6 flex flex-wrap gap-2">
					<span class="badge">Calm</span>
					<span class="badge">Sleep Timer</span>
					<span class="badge">Offline</span>
				</div>
			</div>

			<!-- Featured card -->
			<article
				class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md"
			>
				<img
					src={featured.cover}
					alt={featured.title}
					class="h-72 w-full object-cover opacity-90 sm:h-96"
				/>
				<div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>
				<div class="absolute bottom-0 p-5 sm:p-6">
					<h2 class="text-2xl font-semibold">{featured.title}</h2>
					<p class="mt-1 text-slate-300">{featured.subtitle}</p>
					<div class="mt-3 flex items-center gap-3 text-slate-300/80">
						<span class="inline-flex items-center gap-1">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
								><path
									d="M12 8v5l3 2"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
								/></svg
							>
							{featured.durationMin} min
						</span>
						{#each featured.tags as t}
							<span class="inline-flex items-center gap-1">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
									><circle cx="12" cy="12" r="3" fill="currentColor" /></svg
								>
								{t}
							</span>
						{/each}
					</div>
				</div>
			</article>
		</section>

		<!-- Continue Listening (mock) -->
		<section class="mt-10">
			<h3 class="section-heading">Continue Listening</h3>
			<div class="relative overflow-hidden rounded-2xl bg-slate-900/50 ring-1 ring-white/5">
				<div class="flex items-center gap-4 p-4 sm:p-6">
					<div class="h-14 w-14 overflow-hidden rounded-xl ring-1 ring-white/10">
						<img src={continueImg} alt="Continue" class="h-full w-full object-cover" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="text-sm text-slate-300">Noah and the Rainbow Promise</p>
						<div class="mt-1 h-2 w-full rounded-full bg-slate-700/80">
							<div class="h-2 rounded-full bg-amber-300" style="width: 64%"></div>
						</div>
					</div>
					<a
						href="/stories/noah-rainbow-promise"
						class="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-4 py-2 font-medium text-slate-900 shadow transition hover:shadow-lg"
						>Resume</a
					>
				</div>
			</div>
		</section>

		<!-- Library -->
		<section class="mt-10">
			<h3 class="section-heading">Library</h3>
			<div class="xs:grid-cols-2 grid gap-4 sm:gap-6 lg:grid-cols-4">
				{#each library as story}
					<a
						href={'/stories/' + story.id}
						class="group relative overflow-hidden rounded-2xl bg-slate-900/40 ring-1 ring-white/10 transition hover:ring-white/20"
					>
						<img
							src={story.cover}
							alt={story.title}
							class="h-52 w-full object-cover transition group-hover:scale-[1.02]"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
						<div class="absolute bottom-0 p-4">
							<h4 class="leading-tight font-semibold">{story.title}</h4>
							<div class="mt-1 flex items-center gap-3 text-sm text-slate-300/90">
								<span class="inline-flex items-center gap-1"
									><svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
										><path
											d="M12 8v5l3 2"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
										/></svg
									>{story.durationMin} min</span
								>
								{#if story.tags?.[0]}
									<span>{story.tags[0]}</span>
								{/if}
							</div>
						</div>
						{#if story.previewUrl}
							<button
								type="button"
								class="absolute top-3 right-3 rounded-full bg-slate-900/70 px-3 py-1.5 text-xs ring-1 ring-white/10 hover:bg-slate-900/90"
								onclick={() => playPreview(story)}
								onmouseenter={(e) => {
									e.stopPropagation();
									userGesture && playPreview(story);
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

		<!-- Ambient notice -->
		<p class="mt-8 text-center text-sm text-slate-400/80">
			Tip: Toggle <span class="font-medium text-slate-200">Ambient</span> for soft rain while you browse.
		</p>

		<footer class="py-10 text-center text-slate-400">
			<p>© {new Date().getFullYear()} Drift</p>
		</footer>
	</main>
</div>

<style>
	/* Let Tailwind utilities be used with @apply in component-scoped CSS (Tailwind v4) */
	@reference "tailwindcss";
	/* Starfield adapted from lightweight CSS animations */
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

	.badge {
		@apply inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10 backdrop-blur-md;
	}
	.section-heading {
		@apply mb-3 text-lg font-semibold tracking-wide;
	}
</style>
