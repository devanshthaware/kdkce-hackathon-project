import { initAegisAuth } from "@devanshthaware/aegis-auth";

/**
 * Initializes the AegisAuth SDK for use across the application.
 * Note: These environment variables must be provided in .env.local
 */
const aegisConfig = {
  apiKey: process.env.NEXT_PUBLIC_AEGIS_API_KEY || "placeholder_api_key",
  baseUrl: process.env.NEXT_PUBLIC_AEGIS_BASE_URL || "https://api.aegisauth.com",
  appId: process.env.NEXT_PUBLIC_AEGIS_APP_ID || "placeholder_app_id",
  debug: process.env.NODE_ENV !== "production",
};

// Initialize the SDK once
if (typeof window !== "undefined") {
  initAegisAuth(aegisConfig);
}

export { aegisConfig };
