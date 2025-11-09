// utils/navigation.ts
import { router } from "expo-router";

/**
 * A universal, crash-proof navigation helper for Expo Router.
 * Prevents "Cannot read property 'back' of undefined" by safely
 * checking router readiness and falling back automatically.
 */
export function safeBack(fallback: string = "/") {
  try {
    // If router is missing or still hydrating
    if (!router || typeof router.back !== "function") {
      console.warn("⚠️ Router not ready yet — skipping back()");
      return;
    }

    // Prefer going back if possible
    if ((router as any)?.canGoBack?.()) {
      router.back();
    } else {
      console.warn(`⚠️ No previous route — redirecting to ${fallback}`);
      router.push(fallback);
    }
  } catch (err) {
    console.error("💥 safeBack() caught navigation error:", err);
  }
}

/**
 * A safe version of router.push() that won’t crash if router is undefined.
 */
export function safePush(path: string) {
  try {
    if (!router || typeof router.push !== "function") {
      console.warn("⚠️ Router not ready yet — skipping push()");
      return;
    }
    router.push(path);
  } catch (err) {
    console.error("💥 safePush() caught navigation error:", err);
  }
}

/**
 * Safe replace wrapper — acts like router.replace() but guards undefined cases.
 */
export function safeReplace(path: string) {
  try {
    if (!router || typeof router.replace !== "function") {
      console.warn("⚠️ Router not ready yet — skipping replace()");
      return;
    }
    router.replace(path);
  } catch (err) {
    console.error("💥 safeReplace() caught navigation error:", err);
  }
}

/**
 * Quick log to confirm router availability.
 * You can call this once in any screen during debugging.
 */
export function logRouterState() {
  try {
    console.log("🧭 Router object keys:", Object.keys(router || {}));
    console.log("🧭 router.back exists:", typeof router?.back);
  } catch (err) {
    console.error("💥 logRouterState() error:", err);
  }
}
