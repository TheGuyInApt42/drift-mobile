<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';

	// Most failures on a phone are network ones: the API fetch in a load
	// function throws (offline) or returns 5xx. 404 = genuinely missing story.
	const offline = $derived(typeof navigator !== 'undefined' && navigator.onLine === false);
	const notFound = $derived(page.status === 404);

	let retrying = $state(false);
	async function retry() {
		retrying = true;
		try {
			await invalidateAll();
		} finally {
			retrying = false;
		}
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 text-slate-100"
>
	<div class="max-w-sm text-center">
		<h1 class="mb-2 text-2xl font-semibold">
			{notFound ? 'Story not found' : offline ? "You're offline" : 'Something went wrong'}
		</h1>
		<p class="mb-6 text-slate-300">
			{notFound
				? "The story you're looking for doesn't exist."
				: 'Check your connection and try again.'}
		</p>
		<div class="flex justify-center gap-3">
			{#if !notFound}
				<button
					onclick={retry}
					disabled={retrying}
					class="rounded-xl bg-amber-300 px-4 py-2 font-medium text-slate-900 disabled:opacity-60"
				>
					{retrying ? 'Trying…' : 'Try again'}
				</button>
			{/if}
			<button
				onclick={() => goto('/')}
				class="rounded-xl bg-white/10 px-4 py-2 font-medium text-slate-100 hover:bg-white/20"
			>
				Go Home
			</button>
		</div>
	</div>
</div>
