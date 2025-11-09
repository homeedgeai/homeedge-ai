import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

/**
 * Safe helper functions you can call from anywhere in your app
 */
export function goBackSafe() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  } else {
    console.warn("goBackSafe: no navigation context available");
  }
}

export function navigateSafe(name: string, params?: Record<string, any>) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  } else {
    console.warn("navigateSafe: navigation not ready");
  }
}
