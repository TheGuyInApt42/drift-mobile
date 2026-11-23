package com.selah.audio;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

/**
 * Minimal foreground service. Its only job is to keep the app process —
 * and therefore the WebView's JS thread — alive while a story is playing
 * and the screen is locked or the app is backgrounded. It does NOT touch
 * audio playback itself; that's entirely handled by
 * @capgo/capacitor-native-audio. This class exists purely because that
 * plugin's docs are explicit that foreground-service management is the
 * app's responsibility, not the plugin's.
 */
public class ForegroundAudioService extends Service {

    public static final String CHANNEL_ID = "drift_playback_channel";
    public static final int NOTIFICATION_ID = 1001;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIFICATION_ID, buildNotification());
        // NOT_STICKY: if Android kills the process, don't resurrect an empty
        // service with no player behind it.
        return START_NOT_STICKY;
    }

    /** App swiped away from Recents → stop, so nothing keeps playing with no UI. */
    @Override
    public void onTaskRemoved(Intent rootIntent) {
        stopForeground(true);
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }

    private Notification buildNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Story Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }

        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Selah Audio")
            .setContentText("Playing a story")
            .setSmallIcon(getApplicationInfo().icon) // TODO: swap for a real small notification icon (a plain silhouette, not your full app icon)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build();
    }
}