/**
 * @aegis/auth-sdk - Production-grade Adaptive Authentication SDK
 * Provides device fingerprinting, risk assessment, and continuous monitoring
 */

export { AegisAuth } from "./client";

export type {
  AegisConfig,
  FingerprintPayload,
  LoginPayload,
  RiskResponse,
  RiskLevel,
  SessionPayload,
  RiskAssessmentPayload,
  MonitoringCallback,
} from "./types";

export {
  AegisError,
  NetworkError,
  InvalidResponseError,
  ConfigError,
  TimeoutError,
} from "./errors";

export { collectFingerprint, hashFingerprint, compareFingerprints } from "./fingerprint";

export { startSessionMonitoring, stopSessionMonitoring, isMonitoring } from "./session";

export { delay, withRetry, withTimeout, validateConfig } from "./utils";
