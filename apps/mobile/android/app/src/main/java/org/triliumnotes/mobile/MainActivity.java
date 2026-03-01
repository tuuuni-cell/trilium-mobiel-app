package org.triliumnotes.mobile;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Register Capacitor plugins
        registerPlugin(com.capacitorjs.plugins.app.AppPlugin.class);
        registerPlugin(com.capacitorjs.plugins.keyboard.KeyboardPlugin.class);
        registerPlugin(com.capacitorjs.plugins.preferences.PreferencesPlugin.class);
        registerPlugin(com.capacitorjs.plugins.splashscreen.SplashScreenPlugin.class);
        registerPlugin(com.capacitorjs.plugins.statusbar.StatusBarPlugin.class);

        super.onCreate(savedInstanceState);
    }
}
