/**
 * Configuration for AegisAuth SDK initialization
 */
export interface AegisConfig {
  /** API key for authentication with Aegis backend */
  apiKey: string;
  /** Backend endpoint for risk evaluation */
  endpoint: string;
  /** Enable continuous session monitoring */
  autoMonitor?: boolean;
  /** Interval in milliseconds for session monitoring */
  monitorInterval?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Timeout for API calls in milliseconds */
  timeout?: number;
  /** Number of retries for failed requests */
  retries?: number;
}

/**
 * Device fingerprint payload
 */
export interface FingerprintPayload {
  userAgent: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  hardwareConcurrency: number;
  language: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  timestamp: number;
}

/**
 * Login payload for protective authentication
 */
export interface LoginPayload {
  userId: string;
  email: string;
  metadata?: Record<string, any>;
  simulateFlags?: {
    newDevice?: boolean;
    countryChange?: boolean;
    vpn?: boolean;
    apiBurst?: boolean;
    privilegeEscalation?: boolean;
  };
}

/**
 * Risk level enumeration
 */
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Risk response from backend
 */
export interface RiskResponse {
  risk_score: number;
  risk_level: RiskLevel;
  components: Record<string, number>;
  timestamp?: number;
}

/**
 * Session monitoring payload
 */
export interface SessionPayload {
  apiCalls?: number;
  privilegeEscalation?: boolean;
  sensitiveRoute?: boolean;
  anomalies?: string[];
}

/**
 * Internal API request payload
 */
export interface RiskAssessmentPayload extends LoginPayload {
  fingerprint: FingerprintPayload;
}

/**
 * Monitoring callback function type
 */
export type MonitoringCallback = (risk: RiskResponse) => void;
