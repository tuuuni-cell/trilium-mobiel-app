# Trilium Notes Mobile App

Official mobile application for Trilium Notes, built with [Capacitor](https://capacitorjs.com/).

## Architecture

The mobile app is a **thin native wrapper** around Trilium's existing web client. This approach was chosen because:

- **Minimal maintenance**: The existing mobile layout (`apps/client/src/layouts/mobile_layout.tsx`) already handles the UI
- **Feature parity**: All features available in the web mobile view work automatically
- **CKEditor & CodeMirror**: The same editors used on desktop work in the mobile WebView
- **No duplication**: No need to rewrite widgets, services, or API calls

### How It Works

```
┌─────────────────────────────────────────┐
│            Mobile Device                 │
│  ┌───────────────────────────────────┐  │
│  │     Capacitor Native Shell        │  │
│  │  (Status bar, keyboard, back btn) │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │      Connection Screen      │  │  │
│  │  │  (Configure server URL)     │  │  │
│  │  └──────────┬──────────────────┘  │  │
│  │             │ connects to         │  │
│  │  ┌──────────▼──────────────────┐  │  │
│  │  │     WebView                 │  │  │
│  │  │  (Trilium web client with   │  │  │
│  │  │   ?mobile layout)           │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│              │                           │
│              │  HTTPS / HTTP             │
│              ▼                           │
│  ┌───────────────────────────────────┐  │
│  │     Trilium Server                │  │
│  │  (local network or internet)      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Files Structure

```
apps/mobile/
├── index.html              # Connection/setup screen
├── src/
│   └── main.ts             # App logic (connection, storage, Capacitor plugins)
├── capacitor.config.ts     # Capacitor configuration
├── vite.config.ts          # Vite build config
├── package.json            # Dependencies
├── Dockerfile.android      # Docker-based Android build
├── docker-build.sh         # One-command Docker build script
├── android/                # Native Android project
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/org/triliumnotes/mobile/MainActivity.java
│   │       └── res/         # Android resources (icons, styles, etc.)
│   ├── build.gradle         # Root Gradle config
│   └── settings.gradle      # Gradle project settings
└── ios/                     # (Future) Native iOS project
```

---

## Building the APK (Android)

### Option 1: Docker Build (Recommended - No Local Setup Required)

This is the easiest method. You only need Docker installed.

```bash
# From the repository root:
cd apps/mobile
chmod +x docker-build.sh
./docker-build.sh
```

The APK will be at: `apps/mobile/output/trilium-notes.apk`

**What happens inside Docker:**
1. Installs JDK 17, Android SDK (API 35), Node.js 22
2. Installs npm dependencies
3. Builds the web assets with Vite
4. Copies web assets into the Android project
5. Runs Gradle to build the debug APK
6. Extracts the APK to your `output/` directory

### Option 2: Local Build (Requires Android SDK)

If you have Android Studio or the Android SDK installed:

```bash
# 1. Install dependencies
cd apps/mobile
npm install

# 2. Build web assets
npx vite build

# 3. Sync with Capacitor
npx cap sync android

# 4. Build APK
cd android
./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

### Option 3: Android Studio

```bash
cd apps/mobile
npm install
npx vite build
npx cap sync android
npx cap open android   # Opens Android Studio
```

Then build from Android Studio (Build > Build Bundle(s) / APK(s) > Build APK(s)).

---

## Installing on Android

### Requirements

- Android 8.0 (API 26) or higher
- Tested on Android 16+

### Installation Steps

1. **Transfer the APK** to your phone (USB, email, cloud storage, etc.)

2. **Enable "Install from unknown sources":**
   - Android 8-12: Settings > Security > Unknown Sources
   - Android 13+: Settings > Apps > Special app access > Install unknown apps
   - Select the file manager/browser you'll use to open the APK

3. **Open the APK** file on your phone and tap "Install"

4. **Using ADB** (if developer mode is enabled):
   ```bash
   adb install apps/mobile/output/trilium-notes.apk
   ```

### First Launch

1. Open "Trilium Notes" from your app drawer
2. Enter your Trilium server URL (e.g., `https://my-server:8080`)
3. Optionally give it a name
4. Tap "Connect"
5. Log in with your Trilium credentials
6. The app will remember your server and auto-connect next time

---

## Maintenance Guide

### When the Trilium Server/Backend Changes

The mobile app is a **thin wrapper** - most backend changes require **zero changes** to the mobile app. Here's what to check:

| Backend Change | Mobile App Impact | Action Required |
|---|---|---|
| API endpoint changes | None (client handles it) | None |
| New note types | Auto-supported via WebView | None |
| UI/CSS changes | Auto-reflected in WebView | None |
| New mobile widgets | Auto-loaded in mobile layout | None |
| Authentication changes | May need WebView cookie handling | Test login flow |
| New server config options | May need connection screen update | Test connection |
| Breaking API version change | Connection test may fail | Update `testConnection()` in `main.ts` |
| CKEditor/CodeMirror upgrade | Auto-reflected | None |
| New Capacitor plugin needed | Add to package.json | Run `cap sync` |

### When to Update the Mobile App

1. **Version bump**: Update `version` in `apps/mobile/package.json` and `versionName`/`versionCode` in `android/app/build.gradle`

2. **Capacitor upgrade**:
   ```bash
   cd apps/mobile
   npm update @capacitor/core @capacitor/android @capacitor/cli
   npx cap sync
   ```

3. **Android SDK upgrade**: Update `compileSdk` and `targetSdk` in `android/app/build.gradle`

4. **New native plugins**: Add to `package.json`, register in `MainActivity.java`, run `cap sync`

### Testing Checklist

After any changes, verify:
- [ ] App launches and shows connection screen
- [ ] Can connect to Trilium server
- [ ] Mobile layout loads correctly
- [ ] Note tree navigation works
- [ ] Creating/editing text notes works
- [ ] CKEditor toolbar is usable
- [ ] Back button navigates correctly
- [ ] App remembers server on restart
- [ ] Keyboard doesn't overlap input fields

### Common Issues

**"Connection failed" on local server:**
- Ensure your phone and server are on the same network
- For HTTP (not HTTPS) servers, the app allows cleartext for local IPs (192.168.x.x, 10.x.x.x, 172.16.x.x)
- For remote servers, HTTPS is required

**WebView shows desktop layout:**
- The app appends `?mobile` to the URL to force mobile layout
- If this doesn't work, check server-side view detection in `apps/server/src/routes/index.ts`

**Build fails in Docker:**
- Ensure Docker has at least 4GB RAM allocated
- Try cleaning: `docker system prune` and rebuild
- Check network connectivity (SDK downloads needed)

---

## iOS Support (Future)

The app is architecturally ready for iOS. To add iOS support:

1. Install Xcode on macOS
2. Add iOS platform:
   ```bash
   npx cap add ios
   npx cap sync ios
   npx cap open ios
   ```
3. Configure signing in Xcode
4. Build and deploy

---

## Contributing

When contributing to the mobile app:

1. **Keep it minimal**: This is intentionally a thin wrapper. Don't add features that belong in the web client.
2. **Test on real devices**: Emulators miss touch interactions and performance characteristics.
3. **Follow Trilium conventions**: Use the same code style as the rest of the monorepo.
4. **Update this doc**: If you change build steps or architecture, update this file.
