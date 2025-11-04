import { Howl } from 'howler';

let ambientEnabled = $state(false);
let ambientHowl = $state<Howl | undefined>(undefined);

/**
 * Ambient sound state management
 * This object provides getter/setter access to ambient state
 * for use throughout the application as a single source of truth
 */
export const ambient = {
	get enabled() {
		return ambientEnabled;
	},
	set enabled(value) {
		ambientEnabled = value;
	},
	get howl() {
		return ambientHowl;
	},
	set howl(value) {
		ambientHowl = value;
	}
};

/**
 * Initializes the ambient sound Howl instance if it doesn't exist
 * Creates a looping rain sound effect with low volume (25%) and HTML5 audio
 *
 * @returns The initialized Howl instance for ambient sound
 */
export function initAmbient() {
	if (!ambient.howl) {
		ambient.howl = new Howl({
			src: ['/audio/ambience/rain.mp3'],
			loop: true,
			volume: 0.25,
			preload: true,
			html5: true
		});
	}
	return ambient.howl;
}

/**
 * Toggles the ambient sound (rain) on/off
 * Handles fade in/out effects and state management
 * Uses 600ms fade transitions for smooth audio experience
 *
 * @param markGesture - Optional callback to mark user gesture for audio
 */
export function toggleAmbient(markGesture?: () => void) {
	if (markGesture) {
		markGesture();
	}
	const h = initAmbient();
	ambient.enabled = !ambient.enabled;
	if (ambient.enabled) {
		h.play();
		h.fade(0, 0.25, 600);
	} else {
		h.fade(h.volume(), 0, 600);
		setTimeout(() => h.pause(), 650);
	}
}

/**
 * Immediately stops the ambient sound and resets state
 * Used for cleanup when navigating away from the page
 */
export function stopAmbient() {
	if (ambient.howl) {
		ambient.howl.stop();
	}
	ambient.enabled = false;
}