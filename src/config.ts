// app/config.ts

// ⚙️ Central config for backend URLs and environment settings

export const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  "http://armonmoore.local:8000"; // ← your local FastAPI backend fallback

export const APP_ENV = process.env.NODE_ENV || "development";
