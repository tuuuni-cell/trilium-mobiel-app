import { App as CapApp } from "@capacitor/app";
import { Keyboard } from "@capacitor/keyboard";
import { Preferences } from "@capacitor/preferences";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";

// ── Types ───────────────────────────────────────────────────────────────────

interface SavedServer {
    name: string;
    url: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
    SERVERS: "trilium_servers",
    LAST_SERVER: "trilium_last_server",
    AUTO_CONNECT: "trilium_auto_connect"
} as const;

// ── State ───────────────────────────────────────────────────────────────────

let isCapacitor = false;

// ── DOM Helpers ─────────────────────────────────────────────────────────────

function $(id: string): HTMLElement {
    return document.getElementById(id)!;
}

function setStatus(message: string, type: "error" | "success" | "loading") {
    const el = $("status-message");
    el.textContent = message;
    el.className = `status ${type}`;
}

function clearStatus() {
    const el = $("status-message");
    el.className = "status";
    el.textContent = "";
}

// ── Storage ─────────────────────────────────────────────────────────────────

async function getSavedServers(): Promise<SavedServer[]> {
    try {
        if (isCapacitor) {
            const { value } = await Preferences.get({ key: STORAGE_KEYS.SERVERS });
            return value ? JSON.parse(value) : [];
        }
        const raw = localStorage.getItem(STORAGE_KEYS.SERVERS);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

async function saveServers(servers: SavedServer[]): Promise<void> {
    const json = JSON.stringify(servers);
    if (isCapacitor) {
        await Preferences.set({ key: STORAGE_KEYS.SERVERS, value: json });
    } else {
        localStorage.setItem(STORAGE_KEYS.SERVERS, json);
    }
}

async function getLastServer(): Promise<string | null> {
    if (isCapacitor) {
        const { value } = await Preferences.get({ key: STORAGE_KEYS.LAST_SERVER });
        return value;
    }
    return localStorage.getItem(STORAGE_KEYS.LAST_SERVER);
}

async function setLastServer(url: string): Promise<void> {
    if (isCapacitor) {
        await Preferences.set({ key: STORAGE_KEYS.LAST_SERVER, value: url });
    } else {
        localStorage.setItem(STORAGE_KEYS.LAST_SERVER, url);
    }
}

async function getAutoConnect(): Promise<boolean> {
    if (isCapacitor) {
        const { value } = await Preferences.get({ key: STORAGE_KEYS.AUTO_CONNECT });
        return value === "true";
    }
    return localStorage.getItem(STORAGE_KEYS.AUTO_CONNECT) === "true";
}

async function setAutoConnect(enabled: boolean): Promise<void> {
    if (isCapacitor) {
        await Preferences.set({ key: STORAGE_KEYS.AUTO_CONNECT, value: String(enabled) });
    } else {
        localStorage.setItem(STORAGE_KEYS.AUTO_CONNECT, String(enabled));
    }
}

// ── Server Management ───────────────────────────────────────────────────────

async function addServer(name: string, url: string): Promise<void> {
    const servers = await getSavedServers();
    const existing = servers.findIndex((s) => s.url === url);
    if (existing >= 0) {
        servers[existing].name = name || servers[existing].name;
    } else {
        servers.push({ name: name || url, url });
    }
    await saveServers(servers);
}

async function removeServer(url: string): Promise<void> {
    const servers = await getSavedServers();
    await saveServers(servers.filter((s) => s.url !== url));
    renderSavedServers();
}

// ── Server Connection ───────────────────────────────────────────────────────

function normalizeUrl(url: string): string {
    url = url.trim().replace(/\/+$/, "");
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }
    return url;
}

async function testConnection(url: string): Promise<{ ok: boolean; error?: string }> {
    try {
        // The Trilium server exposes /api/app-info which returns version info
        const response = await fetch(`${url}/api/app-info`, {
            method: "GET",
            signal: AbortSignal.timeout(10000)
        });

        // 401/403 means the server is reachable but requires authentication
        // — that's fine, the user will log in via the WebView
        if (response.status === 401 || response.status === 403) {
            return { ok: true };
        }

        if (!response.ok) {
            return { ok: false, error: `Server responded with status ${response.status}` };
        }

        const data = await response.json();
        if (!data.appVersion) {
            return { ok: false, error: "Not a valid Trilium server" };
        }

        return { ok: true };
    } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") {
            return { ok: false, error: "Connection timed out" };
        }
        if (e instanceof TypeError) {
            return { ok: false, error: "Cannot reach server. Check URL and network." };
        }
        return { ok: false, error: String(e) };
    }
}

async function navigateToServer(url: string): Promise<void> {
    $("loading-overlay").classList.remove("hidden");

    // Force the mobile query parameter so the mobile layout is used
    const separator = url.includes("?") ? "&" : "?";
    const targetUrl = `${url}${separator}mobile`;

    // In Capacitor, we navigate the WebView to the server
    window.location.href = targetUrl;
}

// ── UI Rendering ────────────────────────────────────────────────────────────

async function renderSavedServers(): Promise<void> {
    const servers = await getSavedServers();
    const section = $("saved-servers-section");
    const list = $("saved-servers-list");

    if (servers.length === 0) {
        section.classList.add("hidden");
        return;
    }

    section.classList.remove("hidden");
    list.innerHTML = "";

    for (const server of servers) {
        const item = document.createElement("div");
        item.className = "server-item";
        item.innerHTML = `
            <div style="flex: 1; min-width: 0;">
                <div class="server-name">${escapeHtml(server.name)}</div>
                <div class="server-url">${escapeHtml(server.url)}</div>
            </div>
            <button class="remove-btn" title="Remove">&times;</button>
        `;

        // Click to connect
        item.addEventListener("click", (e) => {
            if ((e.target as HTMLElement).classList.contains("remove-btn")) return;
            ($("server-url") as HTMLInputElement).value = server.url;
            ($("server-name") as HTMLInputElement).value = server.name;
            connectToServer();
        });

        // Remove button
        const removeBtn = item.querySelector(".remove-btn")!;
        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            removeServer(server.url);
        });

        list.appendChild(item);
    }
}

function escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ── Connect Flow ────────────────────────────────────────────────────────────

// Exposed globally for the onclick handler
(window as any).connectToServer = connectToServer;

async function connectToServer(): Promise<void> {
    const urlInput = $("server-url") as HTMLInputElement;
    const nameInput = $("server-name") as HTMLInputElement;
    const btn = $("connect-btn") as HTMLButtonElement;

    const rawUrl = urlInput.value.trim();
    if (!rawUrl) {
        setStatus("Please enter a server URL", "error");
        return;
    }

    const url = normalizeUrl(rawUrl);
    const name = nameInput.value.trim() || url;

    btn.disabled = true;
    clearStatus();
    setStatus("Testing connection...", "loading");

    const result = await testConnection(url);

    if (!result.ok) {
        setStatus(result.error || "Connection failed", "error");
        btn.disabled = false;
        return;
    }

    setStatus("Connected! Loading Trilium...", "success");

    // Save the server for future use
    await addServer(name, url);
    await setLastServer(url);
    await setAutoConnect(true);

    // Navigate to the server
    await navigateToServer(url);
}

// ── Capacitor Platform Setup ────────────────────────────────────────────────

async function setupCapacitor(): Promise<void> {
    try {
        // Status bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#1e1e1e" });
    } catch {
        // Not on a platform that supports StatusBar
    }

    try {
        // Keyboard behavior
        await Keyboard.setResizeMode({ mode: "body" as any });
    } catch {
        // Not on a platform that supports Keyboard
    }

    // Handle back button on Android
    CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
            window.history.back();
        } else {
            CapApp.exitApp();
        }
    });
}

// ── Initialization ──────────────────────────────────────────────────────────

async function init(): Promise<void> {
    // Check if running in Capacitor
    isCapacitor = !!(window as any).Capacitor;

    if (isCapacitor) {
        await setupCapacitor();
    }

    // Show version
    $("app-version").textContent = "Trilium Notes Mobile v0.101.3";

    // Render saved servers
    await renderSavedServers();

    // Auto-connect to last server if enabled
    const autoConnect = await getAutoConnect();
    if (autoConnect) {
        const lastServer = await getLastServer();
        if (lastServer) {
            $("loading-overlay").classList.remove("hidden");
            const result = await testConnection(lastServer);
            if (result.ok) {
                await navigateToServer(lastServer);
                return;
            }
            // Failed auto-connect, show setup screen
            $("loading-overlay").classList.add("hidden");
        }
    }

    // Hide splash screen (Capacitor)
    try {
        await SplashScreen.hide();
    } catch {
        // Not on Capacitor
    }

    // Focus the URL input if empty
    const urlInput = $("server-url") as HTMLInputElement;
    const lastServer = await getLastServer();
    if (lastServer) {
        urlInput.value = lastServer;
    }

    // Handle Enter key on inputs
    urlInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") connectToServer();
    });
    $("server-name").addEventListener("keydown", (e) => {
        if ((e as KeyboardEvent).key === "Enter") connectToServer();
    });
}

init();
