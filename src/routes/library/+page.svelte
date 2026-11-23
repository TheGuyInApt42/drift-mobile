<!--
	Library page — the exhaustive browse surface.
	Home shows a curated slice; this shows every story, with search + tag
	filtering. Filtering is client-side ($derived), since a personal story
	library is small enough that a search-as-you-type round trip to the
	Worker would be overkill.
-->
<script lang="ts">
	import type { PageData } from './$types';

	type Story = {
		id: string;
		title: string;
		subtitle?: string;
		duration_min: number;
		tags: string[];
		cover_url: string;
		preview_url?: string;
	};

	let { data }: { data: PageData } = $props();
	let stories: Story[] = $derived(data.stories);

	let query = $state('');
	let activeTag = $state<string | null>(null);

	// Unique, sorted tag list derived from whatever stories actually have
	const allTags = $derived([...new Set(stories.flatMap((s) => s.tags))].sort());

	const filtered = $derived(
		stories.filter((s) => {
			const q = query.trim().toLowerCase();
			const matchesQuery = q === '' || s.title.toLowerCase().includes(q);
			const matchesTag = !activeTag || s.tags.includes(activeTag);
			return matchesQuery && matchesTag;
		})
	);

	function toggleTag(tag: string) {
		activeTag = activeTag === tag ? null : tag;
	}
</script>

<div
	class="relative min-h-[100svh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
>
	<header class="px-6 pt-6 pb-2 sm:px-10">
		<h1 class="text-2xl font-semibold tracking-wide">Library</h1>
	</header>

	<!-- Search + tag filter bar, sticky so it stays reachable while scrolling a long list -->
	<div class="sticky top-0 z-10 bg-slate-950/80 px-6 py-3 backdrop-blur-md sm:px-10">
		<div class="relative">
			<svg
				class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"
			>
				<circle cx="11" cy="11" r="7" />
				<path d="m21 21-4.3-4.3" stroke-linecap="round" />
			</svg>
			<input
				type="search"
				bind:value={query}
				placeholder="Search stories"
				aria-label="Search stories"
				class="w-full rounded-2xl bg-slate-900/60 py-2.5 pr-4 pl-9 text-sm text-slate-100 ring-1 ring-white/10 backdrop-blur-md placeholder:text-slate-500 focus:ring-amber-300/50 focus:outline-none"
			/>
		</div>

		{#if allTags.length > 0}
			<div class="mt-3 flex gap-2 overflow-x-auto pb-1">
				{#each allTags as tag (tag)}
					{@const active = activeTag === tag}
					<button
						type="button"
						onclick={() => toggleTag(tag)}
						aria-pressed={active}
						class="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition {active
							? 'bg-amber-300 text-slate-900 ring-amber-300'
							: 'bg-slate-900/60 text-slate-300 ring-white/10'}"
					>
						{tag}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<main class="px-6 pt-4 sm:px-10">
		{#if filtered.length === 0}
			<p class="py-16 text-center text-sm text-slate-400">
				{#if query.trim()}
					No stories match "{query}".
				{:else}
					No stories in this tag yet.
				{/if}
			</p>
		{:else}
			<div class="xs:grid-cols-2 grid gap-4 pb-8 sm:gap-6 lg:grid-cols-4">
				{#each filtered as story (story.id)}
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
								<span class="inline-flex items-center gap-1">
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										aria-hidden="true"
										><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" /><path
											d="M12 8v5l3 2"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
										/></svg
									>
									{story.duration_min} min
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</main>
</div>