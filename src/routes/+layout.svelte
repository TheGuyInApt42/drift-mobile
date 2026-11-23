<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { App } from '@capacitor/app';
	import { Capacitor } from '@capacitor/core';
	import { progressStore } from '$lib/stores/progress.svelte';
	import { SplashScreen } from '@capacitor/splash-screen';
	import BottomDock from '$lib/components/BottomDock.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	// Full-screen player shouldn't have a floating dock over it
	const showDock = $derived(!page.url.pathname.startsWith('/stories/'));

	// Three routes that actually exist: Home, Library, Settings.
	// Add Downloads back once offline playback is built.
	const dockItems = [
		{
			href: '/',
			label: 'Home',
			icon: `<svg viewBox="0 0 24 24"><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9"/></svg>`
		},
		{
			href: '/library',
			label: 'Library',
			icon: `<svg viewBox="0 0 24 24"><path d="M4 4h4v16H4zM10 4h4v16h-4zM16 6l4 1.5v13L16 19z"/></svg>`
		},
		{
			href: '/settings',
			label: 'Settings',
			icon: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 0 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 0 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.04z"/></svg>`
		}
	];

	onMount(() => {
		(async () => {
			// Load progress store on every platform (web falls back to localStorage)
			await progressStore.load();
			if (Capacitor.isNativePlatform()) {
				// Wait for your app/data to be ready, then hide
				await SplashScreen.hide({
					fadeOutDuration: 300
				});

				App.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
					if (canGoBack) {
						history.back();
					} else {
						App.minimizeApp();
					}
				});
			}
		})();

		return () => {
			if (Capacitor.isNativePlatform()) {
				App.removeAllListeners();
			}
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div
	class="pt-[var(--safe-area-top)]"
	class:pb-[calc(var(--safe-area-bottom)+96px)]={showDock}
	class:pb-[var(--safe-area-bottom)]={!showDock}
>
	{@render children?.()}
</div>

{#if showDock}
	<BottomDock items={dockItems} />
{/if}