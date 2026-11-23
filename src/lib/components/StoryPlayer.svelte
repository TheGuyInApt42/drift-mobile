<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { Howl } from 'howler';
	import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
	import { NativeAudio } from '@capgo/capacitor-native-audio';

	interface Props {
		/** The single merged audio file for the whole story. */
		audioUrl: string;
		isPlaying?: boolean;
		onPlayStateChange?: (isPlaying: boolean) => void;
		/** Fires once, when the whole story finishes. */
		onFinished?: () => void;
		onTimeUpdate?: (currentTime: number) => void;
		/** Applied once, on initial load — resume position from a previous session. */
		seekToTime?: number | null;
		trackTitle?: string;
		artworkUrl?: string;
	}

	let {
		audioUrl,
		isPlaying = $bindable(false),
		onPlayStateChange = () => {},
		onFinished = () => {},
		onTimeUpdate = () => {},
		seekToTime = null,
		trackTitle = '',
		artworkUrl = ''
	}: Props = $props();

	let currentTime = $state(0);
	let duration = $state(0);
	let isLoading = $state(false);
	let currentlyLoadedUrl = '';

	// ── Network problems ───────────────────────────────────────────────
	// loadError: playback failed (offline, R2 unreachable, read timed out).
	// stalled: we think we're playing but no progress for STALL_MS — weak
	// connection still buffering. Both show an inline banner with Retry.
	let loadError = $state<string | null>(null);
	let stalled = $state(false);
	const STALL_MS = 20_000;
	let lastProgressAt = 0;

	function markProgress() {
		lastProgressAt = Date.now();
		if (stalled) stalled = false;
	}

	function handleLoadError(detail?: unknown) {
		if (detail) console.error('[StoryPlayer] Playback error:', detail);
		isLoading = false;
		stalled = false;
		setPlaying(false);
		loadError =
			typeof navigator !== 'undefined' && navigator.onLine === false
				? "You're offline. Reconnect and tap Retry."
				: "Couldn't load this story. Check your connection and tap Retry.";
	}

	function retry() {
		const resumeAt = currentTime;
		loadError = null;
		stalled = false;
		currentlyLoadedUrl = ''; // force a fresh load
		initStory(true, resumeAt);
		currentTime = resumeAt; // keep the bar where the listener was
	}

	// ── Engine choice ─────────────────────────────────────────────────
	// On Android/iOS the story plays through @capgo/capacitor-native-audio
	// (ExoPlayer / AVPlayer), NOT the WebView. WebView <audio> gets frozen
	// by Android a minute or two after the screen locks, which is what
	// was cutting stories off. Howler stays as the web/dev-server fallback.
	const isNative = Capacitor.isNativePlatform();
	const ASSET_ID = 'story';

	// Keeps the process alive while the screen is locked (Android only).
	// Native side: android/.../ForegroundAudioService(Plugin).java. Its
	// notification shares id 1001 with NativeAudio's media notification,
	// so the media-controls notification becomes the foreground one.
	const ForegroundAudioService = registerPlugin<{
		start(): Promise<void>;
		stop(): Promise<void>;
	}>('ForegroundAudioService');
	const isAndroid = Capacitor.getPlatform() === 'android';
	let serviceRunning = false;

	async function startService() {
		if (!isAndroid || serviceRunning) return;
		try {
			await ForegroundAudioService.start();
			serviceRunning = true;
		} catch (e) {
			console.error('[StoryPlayer] Could not start foreground service', e);
		}
	}

	async function stopService() {
		if (!isAndroid || !serviceRunning) return;
		serviceRunning = false;
		try {
			await ForegroundAudioService.stop();
		} catch {
			// already stopped
		}
	}

	// configure() is global to the plugin — do it once per app session.
	let configured: Promise<void> | null = null;
	function configureNative() {
		configured ??= NativeAudio.configure({
			backgroundPlayback: true, // don't auto-pause when the app is backgrounded
			showNotification: true, // lock-screen / notification-shade controls
			// Audio focus is handled per-play by ExoPlayer itself (patched in
			// patches/@capgo__capacitor-native-audio@8.4.28.patch): pauses for
			// Spotify/calls/alarms, resumes after short interruptions, pauses
			// when headphones unplug. The plugin's own focus handling only
			// requested focus once at startup, so leave it off.
			focus: false
			// NOTE: don't pass `background: true` — on Android it switches the
			// audio mode to MODE_IN_COMMUNICATION (phone-call routing).
		}).catch((e) => console.error('[StoryPlayer] NativeAudio.configure failed', e));
		return configured;
	}

	let nativeLoaded = false;
	let nativeStarted = false; // play() has been called at least once for this asset
	let pendingSeek: number | null = null;
	let nativeListeners: PluginListenerHandle[] = [];

	// Web fallback
	let storyHowl: Howl | null = null;

	function setPlaying(playing: boolean) {
		if (isPlaying === playing) return;
		isPlaying = playing;
		onPlayStateChange(playing);
		if (!isNative) setMediaSessionPlaybackState(playing ? 'playing' : 'paused');
	}

	function finish() {
		setPlaying(false);
		nativeStarted = false;
		stopService();
		onFinished();
	}

	// ── MediaSession (web only — native gets this from the plugin) ──────
	function hasMediaSession() {
		return !isNative && typeof navigator !== 'undefined' && 'mediaSession' in navigator;
	}

	function updateMediaSessionMetadata() {
		if (!hasMediaSession()) return;
		navigator.mediaSession.metadata = new MediaMetadata({
			title: trackTitle || 'Story',
			artwork: artworkUrl ? [{ src: artworkUrl, sizes: '512x512', type: 'image/png' }] : []
		});
	}

	function updatePositionState() {
		if (!hasMediaSession() || typeof navigator.mediaSession.setPositionState !== 'function') return;
		if (duration <= 0) return;
		try {
			navigator.mediaSession.setPositionState({
				duration,
				playbackRate: 1,
				position: Math.min(currentTime, duration)
			});
		} catch {
			// harmless
		}
	}

	function setMediaSessionPlaybackState(state: MediaSessionPlaybackState) {
		if (!hasMediaSession()) return;
		navigator.mediaSession.playbackState = state;
	}

	function registerMediaSessionHandlers() {
		if (!hasMediaSession()) return;
		navigator.mediaSession.setActionHandler('play', () => play());
		navigator.mediaSession.setActionHandler('pause', () => pause());
		navigator.mediaSession.setActionHandler('seekbackward', (d) => seekTo(currentTime - (d.seekOffset ?? 10)));
		navigator.mediaSession.setActionHandler('seekforward', (d) => seekTo(currentTime + (d.seekOffset ?? 10)));
		navigator.mediaSession.setActionHandler('seekto', (d) => {
			if (d.seekTime != null) seekTo(d.seekTime);
		});
	}

	function clearMediaSessionHandlers() {
		if (!hasMediaSession()) return;
		const actions: MediaSessionAction[] = ['play', 'pause', 'seekbackward', 'seekforward', 'seekto'];
		for (const action of actions) {
			try {
				navigator.mediaSession.setActionHandler(action, null);
			} catch {
				// not supported everywhere
			}
		}
		navigator.mediaSession.playbackState = 'none';
	}

	// ── Native engine ─────────────────────────────────────────────────
	async function addNativeListeners() {
		nativeListeners.push(
			await NativeAudio.addListener('currentTime', (e) => {
				if (e.assetId !== ASSET_ID) return;
				currentTime = duration > 0 ? Math.min(e.currentTime, duration) : e.currentTime;
				markProgress();
				onTimeUpdate(currentTime);
			}),
			await NativeAudio.addListener('complete', async (e) => {
				if (e.assetId !== ASSET_ID) return;
				// Belt-and-braces: older plugin builds fired a bogus `complete`
				// after a seek. If audio is still going, it isn't finished.
				const still = await NativeAudio.isPlaying({ assetId: ASSET_ID }).catch(() => ({
					isPlaying: false
				}));
				if (still.isPlaying) return;
				currentTime = duration;
				finish();
			}),
			// Fires after lock-screen / notification actions (and focus loss),
			// so the in-app button stays in sync with what's actually playing.
			await NativeAudio.addListener('playbackState', (e) => {
				if (e.assetId !== ASSET_ID || e.reason === 'complete') return;
				if (e.reason?.startsWith('error')) {
					handleLoadError(e.reason);
					return;
				}
				if (e.duration && e.duration > 0) duration = e.duration;
				if (e.currentTime != null) currentTime = e.currentTime;
				setPlaying(e.isPlaying);
				if (e.state === 'stopped') stopService();
			})
		);
	}

	async function unloadNative() {
		if (!nativeLoaded) return;
		nativeLoaded = false;
		nativeStarted = false;
		try {
			await NativeAudio.unload({ assetId: ASSET_ID });
		} catch {
			// not loaded
		}
	}

	async function initNative(shouldAutoPlay: boolean, seekPosition: number | null) {
		await configureNative();
		await unloadNative();
		try {
			await NativeAudio.preload({
				assetId: ASSET_ID,
				assetPath: audioUrl,
				isUrl: true,
				notificationMetadata: {
					title: trackTitle || 'Story',
					artist: 'Selah Audio',
					artworkUrl: artworkUrl || undefined
				}
			});
			nativeLoaded = true;
			const d = await NativeAudio.getDuration({ assetId: ASSET_ID }).catch(() => ({ duration: 0 }));
			duration = d.duration > 0 ? d.duration : 0;
			if (seekPosition !== null && seekPosition > 0) {
				const clamped = duration > 0 ? Math.min(seekPosition, Math.max(duration - 0.5, 0)) : seekPosition;
				pendingSeek = clamped;
				currentTime = clamped;
			}
			isLoading = false;
			if (shouldAutoPlay || untrack(() => isPlaying)) await play();
		} catch (e) {
			currentlyLoadedUrl = '';
			handleLoadError(e);
		}
	}

	// ── Web engine (Howler) ───────────────────────────────────────────
	function initWeb(shouldAutoPlay: boolean, seekPosition: number | null) {
		if (storyHowl) {
			storyHowl.stop();
			storyHowl.unload();
			storyHowl = null;
		}
		storyHowl = new Howl({
			src: [audioUrl],
			html5: true,
			onload: () => {
				duration = storyHowl?.duration() || 0;
				isLoading = false;
				updateMediaSessionMetadata();
				updatePositionState();
				if (seekPosition !== null && seekPosition > 0) {
					const clamped = duration > 0 ? Math.min(seekPosition, Math.max(duration - 0.5, 0)) : 0;
					storyHowl?.seek(clamped);
					currentTime = clamped;
				}
				if (shouldAutoPlay || untrack(() => isPlaying)) storyHowl?.play();
			},
			onplay: () => {
				setPlaying(true);
				updateTime();
			},
			onpause: () => setPlaying(false),
			onstop: () => {
				currentTime = 0;
				setPlaying(false);
			},
			onend: () => finish(),
			onloaderror: (_id, err) => {
				currentlyLoadedUrl = '';
				handleLoadError(err ?? audioUrl);
			},
			onplayerror: (_id, err) => handleLoadError(err ?? audioUrl)
		});
	}

	function updateTime() {
		if (storyHowl && isPlaying) {
			const raw = storyHowl.seek() || 0;
			currentTime = duration > 0 ? Math.min(raw, duration) : raw;
			markProgress();
			onTimeUpdate(currentTime);
			updatePositionState();
			requestAnimationFrame(updateTime);
		}
	}

	// ── Shared controls ───────────────────────────────────────────────
	function initStory(shouldAutoPlay = false, seekPosition: number | null = null) {
		if (!audioUrl || audioUrl === currentlyLoadedUrl) return;
		isLoading = true;
		currentlyLoadedUrl = audioUrl;
		currentTime = 0;
		duration = 0;
		if (isNative) initNative(shouldAutoPlay, seekPosition);
		else initWeb(shouldAutoPlay, seekPosition);
	}

	async function play() {
		if (!isNative) {
			storyHowl?.play();
			return;
		}
		if (!nativeLoaded) return;
		markProgress(); // start the stall watchdog's clock
		// Start the foreground service BEFORE audio, while we're still in the
		// foreground — Android 12+ refuses to start one from the background.
		await startService();
		try {
			if (nativeStarted) {
				await NativeAudio.resume({ assetId: ASSET_ID });
			} else {
				await NativeAudio.play({ assetId: ASSET_ID, time: pendingSeek ?? 0 });
				pendingSeek = null;
				nativeStarted = true;
			}
			setPlaying(true);
			if (duration <= 0) {
				const d = await NativeAudio.getDuration({ assetId: ASSET_ID }).catch(() => ({ duration: 0 }));
				if (d.duration > 0) duration = d.duration;
			}
		} catch (e) {
			handleLoadError(e);
		}
	}

	async function pause() {
		if (!isNative) {
			storyHowl?.pause();
			return;
		}
		try {
			await NativeAudio.pause({ assetId: ASSET_ID });
		} catch {
			// not playing
		}
		// Service stays up while paused so the lock-screen play button keeps working.
		setPlaying(false);
	}

	function togglePlay() {
		if (loadError) {
			retry();
			return;
		}
		if (!currentlyLoadedUrl) {
			initStory(true);
			return;
		}
		if (isLoading) return;
		if (isPlaying) pause();
		else play();
	}

	function seekTo(seconds: number) {
		const clamped = duration > 0 ? Math.min(Math.max(seconds, 0), duration) : Math.max(seconds, 0);
		currentTime = clamped;
		if (!isNative) {
			storyHowl?.seek(clamped);
			updatePositionState();
			return;
		}
		if (!nativeLoaded) return;
		if (nativeStarted) {
			NativeAudio.setCurrentTime({ assetId: ASSET_ID, time: clamped }).catch(() => {});
		} else {
			pendingSeek = clamped;
		}
	}

	// Exposed so the parent can jump to a chapter mid-playback via
	// bind:this — e.g. `playerRef.seekTo(chapter.startSeconds)`.
	export { seekTo };

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	// Reactive: only runs when audioUrl actually changes (once per story)
	$effect(() => {
		if (audioUrl) {
			const wasPlaying = untrack(() => isPlaying);
			// Defer to next microtask so the parent's onMount can set
			// seekToTime first (resume-position logic runs there).
			Promise.resolve().then(() => {
				const seekPos = untrack(() => seekToTime);
				initStory(wasPlaying, seekPos);
			});
		}
	});

	onMount(() => {
		if (isNative) addNativeListeners();
		else registerMediaSessionHandlers();

		const watchdog = setInterval(() => {
			if (isPlaying && !loadError && Date.now() - lastProgressAt > STALL_MS) stalled = true;
		}, 5_000);

		return () => {
			clearInterval(watchdog);
			if (isNative) {
				for (const l of nativeListeners) l.remove();
				nativeListeners = [];
				NativeAudio.stop({ assetId: ASSET_ID }).catch(() => {});
				unloadNative();
				stopService();
			} else {
				clearMediaSessionHandlers();
				if (storyHowl) {
					storyHowl.stop();
					storyHowl.unload();
				}
			}
		};
	});
</script>

<div class="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
	<div class="mb-8 flex items-center justify-center">
		<button
			onclick={togglePlay}
			disabled={isLoading}
			class="group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-300 to-amber-400 text-slate-900 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
		>
			{#if isLoading}
				<svg class="h-8 w-8 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.3" />
					<path
						d="M12 2a10 10 0 0 1 10 10"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			{:else if isPlaying}
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<rect x="6" y="4" width="4" height="16" fill="currentColor" rx="1" />
					<rect x="14" y="4" width="4" height="16" fill="currentColor" rx="1" />
				</svg>
			{:else}
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M8 5v14l11-7z" fill="currentColor" />
				</svg>
			{/if}
		</button>
	</div>

	<div>
		<div class="mb-3 flex justify-between text-sm text-slate-300">
			<span>{formatTime(currentTime)}</span>
			<span>{formatTime(duration)}</span>
		</div>
		<div
			class="group h-3 w-full cursor-pointer rounded-full bg-slate-700/50 transition-all hover:h-4"
			role="slider"
			tabindex="0"
			aria-label="Audio progress bar"
			aria-valuemin="0"
			aria-valuemax={duration}
			aria-valuenow={currentTime}
			onclick={(e) => {
				if (duration === 0) return;
				const rect = e.currentTarget.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const percentage = x / rect.width;
				seekTo(percentage * duration);
			}}
			onkeydown={(e) => {
				if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
					e.preventDefault();
					const step = duration * 0.05;
					const newTime =
						e.key === 'ArrowLeft'
							? Math.max(0, currentTime - step)
							: Math.min(duration, currentTime + step);
					seekTo(newTime);
				}
			}}
		>
			<div
				class="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-400 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/25"
				style="width: {duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%"
			></div>
		</div>
	</div>
	{#if loadError || stalled}
		<div
			role="alert"
			class="mt-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm {loadError
				? 'border-red-500/30 bg-red-500/10 text-red-200'
				: 'border-amber-400/30 bg-amber-400/10 text-amber-100'}"
		>
			<span>{loadError ?? 'Still loading… your connection may be slow.'}</span>
			<button
				onclick={retry}
				class="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 font-medium text-white transition hover:bg-white/20"
			>
				Retry
			</button>
		</div>
	{/if}
</div>