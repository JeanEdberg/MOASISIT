import { useEffect } from "react";

/**
 * Registers the offline service worker (`public/sw.js`) on the client.
 * Only runs in secure contexts (https or localhost) and never in the dev
 * server, so hot reload keeps working while production/installed PWAs cache.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (!import.meta.env.PROD) return;
    if (!window.isSecureContext) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("No se pudo registrar el service worker:", error);
    });
  }, []);

  return null;
}
