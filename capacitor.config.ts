import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.selah.audio',
  appName: 'Selah Audio',
  webDir: 'build',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
      backgroundColor: '#061426',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    NativeAudio: {
		hls: false // no m3u8 streaming in this app — plain MP3 only
	}
  }

  
  /* server: {
    url: 'http://192.168.0.187:5173', // your LAN IP + Vite port
    cleartext: true                  // allow http during dev
  } */
};

export default config;
