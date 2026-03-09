"use client";

import { AegisAuth } from "@aegis/auth-sdk";
import { DEMO_PROJECT, getAegisEndpoint } from "./demoConfig";

const endpoint = getAegisEndpoint();
const apiKey = DEMO_PROJECT.apiKey;

if (!apiKey || apiKey.length < 10) {
  console.warn(
    "[AegisAuth Demo] Invalid or placeholder API key. Set NEXT_PUBLIC_AEGIS_API_KEY in .env.local for real evaluation."
  );
}

export const aegisClient = new AegisAuth({
  apiKey: apiKey.length >= 10 ? apiKey : "demo-key-12345-placeholder",
  endpoint,
  autoMonitor: false,
  monitorInterval: 5000,
  debug: process.env.NODE_ENV === "development",
  timeout: 15000,
  retries: 1,
});
