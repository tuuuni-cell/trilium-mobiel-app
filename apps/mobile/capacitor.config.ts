import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "org.triliumnotes.mobile",
    appName: "Trilium Notes",
    webDir: "dist",
    // The app loads from a remote server URL configured by the user.
    // This is set dynamically at runtime via the connection screen.
    server: {
        // Allow mixed content for local dev servers
        androidScheme: "https",
        // Allow navigation to user's server
        allowNavigation: ["*"]
    },
    plugins: {
        SplashScreen: {
            launchAutoHide: false,
            backgroundColor: "#1e1e1e",
            showSpinner: true,
            spinnerColor: "#888888"
        },
        Keyboard: {
            resize: "body",
            resizeOnFullScreen: true
        },
        StatusBar: {
            style: "dark",
            backgroundColor: "#1e1e1e"
        }
    },
    android: {
        allowMixedContent: true,
        captureInput: true,
        webContentsDebuggingEnabled: true
    },
    ios: {
        contentInset: "automatic",
        allowsLinkPreview: false
    }
};

export default config;
