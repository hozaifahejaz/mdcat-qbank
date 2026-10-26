/* This browser's device id: made once, kept in localStorage. Clearing site data makes it a new device,
   which is why the server, not this id, decides how many devices an account may hold. */
const KEY = "device-id";

export function getDeviceKey(): string {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved && /^[0-9a-f-]{36}$/i.test(saved)) return saved;
    const made = crypto.randomUUID();
    localStorage.setItem(KEY, made);
    return made;
  } catch {
    return crypto.randomUUID();
  }
}

/* A name the student will recognise in their device list, like "Chrome on Android". */
export function deviceLabel(): string {
  const ua = navigator.userAgent;
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /SamsungBrowser/.test(ua) ? "Samsung Internet" :
    /Firefox|FxiOS/.test(ua) ? "Firefox" :
    /Chrome|CriOS/.test(ua) ? "Chrome" :
    /Safari/.test(ua) ? "Safari" : "Browser";
  const os =
    /iPhone/.test(ua) ? "iPhone" :
    /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? "iPad" :
    /Android/.test(ua) ? "Android" :
    /Windows/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "Mac" :
    /CrOS/.test(ua) ? "Chromebook" :
    /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}
