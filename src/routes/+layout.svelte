<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { App } from '@capacitor/app';
	import { Capacitor } from '@capacitor/core';

	let { children } = $props();

	onMount(() => {
		(async () => {
			if (Capacitor.isNativePlatform()) {
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

{@render children?.()}
