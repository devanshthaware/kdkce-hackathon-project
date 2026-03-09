/**
 * Demo app configuration – use real API key from your platform.
 * Set NEXT_PUBLIC_AEGIS_API in .env.local for endpoint (e.g. https://api.aegisauth.com).
 */

export const DEMO_PROJECT = {
  projectId: "demo_project_01",
  apiKey:
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_AEGIS_API_KEY
      ? process.env.NEXT_PUBLIC_AEGIS_API_KEY
      : "LIVE_API_KEY_FROM_PLATFORM",
} as const;

export function getAegisEndpoint(): string {
  return typeof process !== "undefined" && process.env.NEXT_PUBLIC_AEGIS_API
    ? process.env.NEXT_PUBLIC_AEGIS_API
    : "http://localhost:8000";
}
