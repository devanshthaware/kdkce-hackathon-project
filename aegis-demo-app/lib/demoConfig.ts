/**
 * Demo app configuration – credentials from AegisAuth Platform dashboard.
 * Set vars in .env.local.
 */

export const DEMO_PROJECT = {
  appId:
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_AEGIS_APP_ID
      ? process.env.NEXT_PUBLIC_AEGIS_APP_ID
      : "app_3ybei5",
  apiKey:
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_AEGIS_API_KEY
      ? process.env.NEXT_PUBLIC_AEGIS_API_KEY
      : "ak_live_c3cz1eqa",
  secret:
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_AEGIS_SECRET
      ? process.env.NEXT_PUBLIC_AEGIS_SECRET
      : "sk_live_229mynhc",
} as const;

export function getAegisEndpoint(): string {
  return typeof process !== "undefined" && process.env.NEXT_PUBLIC_AEGIS_API
    ? process.env.NEXT_PUBLIC_AEGIS_API
    : "https://api.aegisauth.com";
}
