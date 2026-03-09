import { FingerprintPayload } from "./types";

/**
 * Collects safe browser signals for device fingerprinting
 * Privacy-safe: uses only non-personally-identifying information
 */
export function collectFingerprint(): FingerprintPayload {
  // Detect if running in browser
  const isBrowser = typeof window !== "undefined" && typeof navigator !== "undefined";

  if (!isBrowser) {
    // Fallback for non-browser environments (Node.js)
    return {
      userAgent: "node",
      platform: "node",
      screenResolution: "0x0",
      timezone: "UTC",
      hardwareConcurrency: 1,
      language: "en",
      cookieEnabled: false,
      doNotTrack: null,
      timestamp: Date.now(),
    };
  }

  // Get screen resolution
  const screenResolution =
    typeof window !== "undefined"
      ? `${window.innerWidth || screen.width}x${window.innerHeight || screen.height}`
      : "0x0";

  // Get timezone offset
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Get DoNotTrack setting
  const doNotTrack =
    (navigator as any).doNotTrack ||
    (window as any).doNotTrack ||
    (navigator as any).msDoNotTrack;

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenResolution,
    timezone,
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: doNotTrack || null,
    timestamp: Date.now(),
  };
}

/**
 * Creates SHA-256 hash of fingerprint data using Web Crypto API
 * Returns hex string representation
 */
export async function hashFingerprint(fingerprint: FingerprintPayload): Promise<string> {
  // Check if crypto is available (browser)
  if (typeof crypto === "undefined" || typeof crypto.subtle === "undefined") {
    // Fallback: simple string hash for non-crypto environments
    return simpleHash(JSON.stringify(fingerprint));
  }

  const data = new TextEncoder().encode(JSON.stringify(fingerprint));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

/**
 * Fallback simple hash function
 * Not cryptographically secure, but provides basic hashing
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Check if device fingerprints match (with some tolerance for minor variations)
 */
export function compareFingerprints(fp1: FingerprintPayload, fp2: FingerprintPayload): boolean {
  return (
    fp1.userAgent === fp2.userAgent &&
    fp1.platform === fp2.platform &&
    fp1.screenResolution === fp2.screenResolution &&
    fp1.timezone === fp2.timezone &&
    fp1.language === fp2.language
  );
}
