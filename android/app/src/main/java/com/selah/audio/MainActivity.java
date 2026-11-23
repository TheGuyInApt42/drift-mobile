package com.selah.audio;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ForegroundAudioServicePlugin.class);
        super.onCreate(savedInstanceState);
    }
}