// app/_shim.js
// Ensures router methods exist even before hydration (prevents "undefined back" errors)

import "expo-router/entry";

if (typeof globalThis.__routerSafePatched === "undefined") {
  globalThis.__routerSafePatched = true;

  try {
    const { useRouter } = require("expo-router");

    // Fake router fallback for early renders
    const fallbackRouter = {
      back: () => console.warn("⚠️ router.back() called too early — ignored"),
      push: () => console.warn("⚠️ router.push() called too early — ignored"),
      replace: () => console.warn("⚠️ router.replace() called too early — ignored"),
      navigate: () => console.warn("⚠️ router.navigate() called too early — ignored"),
      prefetch: () => console.warn("⚠️ router.prefetch() called too early — ignored"),
      reload: () => console.warn("⚠️ router.reload() called too early — ignored"),
      dismiss: () => console.warn("⚠️ router.dismiss() called too early — ignored"),
      dismissAll: () => console.warn("⚠️ router.dismissAll() called too early — ignored"),
      dismissTo: () => console.warn("⚠️ router.dismissTo() called too early — ignored"),
      setParams: () => console.warn("⚠️ router.setParams() called too early — ignored"),
    };

    // If router is not ready yet, expose fallback
    globalThis.__routerFallback = fallbackRouter;
  } catch (err) {
    console.error("❌ Failed to patch router:", err);
  }
}
