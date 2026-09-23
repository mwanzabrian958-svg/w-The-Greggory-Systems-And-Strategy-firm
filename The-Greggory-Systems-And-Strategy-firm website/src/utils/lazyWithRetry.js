import { lazy } from "react";

/**
 * React.lazy that survives deployments.
 *
 * Page chunks are content-hashed, so a tab left open across a deploy keeps the
 * OLD chunk graph: its cached shell references chunk filenames that no longer
 * exist on the server, and the first navigation throws
 * "Failed to fetch dynamically imported module". Resetting the error boundary
 * cannot fix that — only loading a fresh index.html can.
 *
 * This reloads the page once when a chunk import fails, so the browser picks
 * up the current build. A sessionStorage flag (cleared on every successful
 * load) prevents reload loops when the network is genuinely down.
 */
export function lazyWithRetry(importer) {
  const FLAG = "gf_chunk_reload_attempted";
  return lazy(async () => {
    try {
      const mod = await importer();
      try {
        sessionStorage.removeItem(FLAG);
      } catch {
        /* storage unavailable — not fatal */
      }
      return mod;
    } catch (error) {
      let alreadyReloaded = true;
      try {
        alreadyReloaded = sessionStorage.getItem(FLAG) === "1";
        if (!alreadyReloaded) sessionStorage.setItem(FLAG, "1");
      } catch {
        alreadyReloaded = false;
      }
      if (!alreadyReloaded && typeof window !== "undefined") {
        window.location.reload();
        // Never settles: the reload tears the page down before React could
        // render anything from the thrown error.
        return new Promise(() => {});
      }
      throw error;
    }
  });
}
