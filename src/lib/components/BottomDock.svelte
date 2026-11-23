<!--
	BottomDock.svelte

	Floating, glass-blurred tab bar. Active tab is derived from the current
	route (`$app/state`'s `page.url.pathname`), not local component state —
	so it stays in sync with the URL on back/forward nav, deep links, etc.
-->
<script lang="ts">
	import { page } from '$app/state';

	type DockItem = {
		href: string;
		label: string;
		/** inline SVG markup, viewBox "0 0 24 24" */
		icon: string;
	};

	let { items }: { items: DockItem[] } = $props();

	function isActive(href: string) {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}
</script>

<nav
	class="fixed inset-x-0 bottom-[max(20px,var(--safe-area-bottom))] z-50 mx-auto flex w-fit gap-1 rounded-3xl border border-white/10 bg-slate-900/70 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl"
	aria-label="Primary"
>
	{#each items as item (item.href)}
		{@const active = isActive(item.href)}
		<a
			href={item.href}
			aria-current={active ? 'page' : undefined}
			class="flex w-16 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-colors"
			class:text-amber-300={active}
			class:text-slate-400={!active}
		>
			<span
				class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:stroke-[1.75]"
				class:drop-shadow-[0_0_6px_rgba(252,211,77,0.5)]={active}
			>
				{@html item.icon}
			</span>
			<span class="text-[11px] font-medium">{item.label}</span>
		</a>
	{/each}
</nav>