// router-shim.js
import { useRouter } from "expo-router";

let safeRouter = {
  back: () => console.log("⚠️ router.back() called before hydration"),
  push: () => console.log("⚠️ router.push() called before hydration"),
  replace: () => console.log("⚠️ router.replace() called before hydration"),
  prefetch: () => {},
  reload: () => {},
  canGoBack: () => false,
  setParams: () => {},
};

// Patch global useRouter to prevent undefined router access
export function useSafeRouter() {
  try {
    const router = useRouter();
    if (router && typeof router.back === "function") {
      safeRouter = router;
    }
  } catch (e) {
    // still before hydration
  }
  return safeRouter;
}
