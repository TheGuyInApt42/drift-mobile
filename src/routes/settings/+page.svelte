<!--
	Settings — intentionally minimal for now. Ambient default is the only
	control; sleep timer default, playback speed, etc. can slot in here
	as they're built rather than stubbing them out ahead of need.
-->
<script lang="ts">
	import { ambient, toggleAmbient } from '$lib/state/ambient.svelte';
</script>

<div
	class="relative min-h-[100svh] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100"
>
	<header class="px-6 pt-6 pb-4 sm:px-10">
		<h1 class="text-2xl font-semibold tracking-wide">Settings</h1>
	</header>

	<main class="px-6 sm:px-10">
		<div class="rounded-2xl bg-slate-900/50 ring-1 ring-white/5">
			<div class="flex items-center justify-between gap-4 p-4 sm:p-5">
				<div>
					<p class="font-medium">Ambient rain sound</p>
					<p class="mt-0.5 text-sm text-slate-400">Plays softly while you browse the library.</p>
				</div>
				<button
					class="relative flex h-6 w-11 shrink-0 items-center rounded-full bg-slate-700 transition"
					onclick={() => toggleAmbient()}
					aria-pressed={ambient.enabled}
					aria-label={`Ambient rain sound ${ambient.enabled ? 'on' : 'off'}`}
				>
					<span
						class="absolute h-5 w-5 rounded-full bg-amber-300 transition-transform"
						style:transform={ambient.enabled ? 'translateX(22px)' : 'translateX(2px)'}
					></span>
				</button>
			</div>
		</div>
	</main>
</div>