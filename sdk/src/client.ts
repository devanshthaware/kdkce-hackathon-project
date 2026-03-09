import axios, { AxiosInstance } from "axios";
import {
  AegisConfig,
  LoginPayload,
  RiskResponse,
  RiskAssessmentPayload,
  MonitoringCallback,
  RiskLevel,
} from "./types";
import {
  collectFingerprint,
  compareFingerprints,
} from "./fingerprint";
import {
  startSessionMonitoring,
  stopSessionMonitoring,
  isMonitoring,
} from "./session";
import {
  withRetry,
  withTimeout,
  validateConfig,
  createLogger,
  generateRequestId,
} from "./utils";
import {
  AegisError,
  NetworkError,
  InvalidResponseError,
  ConfigError,
  TimeoutError,
} from "./errors";

/**
 * Main AegisAuth client class
 * Handles authentication risk assessment and continuous monitoring
 */
export class AegisAuth {
  private apiKey: string;
  private endpoint: string;
  private autoMonitor: boolean;
  private monitorInterval: number;
  private timeout: number;
  private retries: number;
  private client: AxiosInstance;
  private monitoringId: string | null = null;
  private logger: ReturnType<typeof createLogger>;
  private lastFingerprint: ReturnType<typeof collectFingerprint> | null = null;
  private cachedRisk: RiskResponse | null = null;

  /**
   * Initialize AegisAuth client
   */
  constructor(config: AegisConfig) {
    // Validate configuration
    const validation = validateConfig(config);
    if (!validation.valid) {
      throw new ConfigError(
        `Invalid configuration: ${validation.errors.join(", ")}`
      );
    }

    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint;
    this.autoMonitor = config.autoMonitor ?? false;
    this.monitorInterval = config.monitorInterval ?? 5000;
    this.timeout = config.timeout ?? 10000;
    this.retries = config.retries ?? 1;
    this.logger = createLogger(config.debug ?? false);

    // Initialize axios client
    this.client = axios.create({
      timeout: this.timeout,
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
        "User-Agent": "aegis-auth-sdk/1.0.0",
      },
    });

    this.logger.log("AegisAuth client initialized", {
      endpoint: this.endpoint,
      autoMonitor: this.autoMonitor,
      monitorInterval: this.monitorInterval,
    });
  }

  /**
   * Protect login with risk assessment
   */
  async protectLogin(payload: LoginPayload): Promise<RiskResponse> {
    try {
      this.logger.log("Protecting login", { userId: payload.userId });

      // Collect current fingerprint
      const fingerprint = collectFingerprint();
      this.lastFingerprint = fingerprint;

      // Prepare risk assessment payload
      const assessmentPayload: RiskAssessmentPayload = {
        ...payload,
        fingerprint,
      };

      // Call backend with retry and timeout
      const response = await withRetry(
        async () => {
          return withTimeout(
            this.client.post<RiskResponse>(
              `${this.endpoint}/predict/risk`,
              assessmentPayload
            ),
            this.timeout
          );
        },
        this.retries
      );

      const risk: RiskResponse = response.data;

      // Validate response
      if (!this.validateRiskResponse(risk)) {
        throw new InvalidResponseError("Invalid risk response from backend", risk);
      }

      // Add timestamp if not present
      if (!risk.timestamp) {
        risk.timestamp = Date.now();
      }

      // Cache the result
      this.cachedRisk = risk;

      this.logger.log("Login protected", {
        riskLevel: risk.risk_level,
        riskScore: risk.risk_score,
      });

      // Auto-start monitoring if enabled
      if (this.autoMonitor && !isMonitoring()) {
        this.startMonitoring(() => {
          this.logger.log("Automatic monitoring check triggered");
        });
      }

      return risk;
    } catch (error) {
      this.logger.error("protectLogin failed", error);
      return this.handleError(error);
    }
  }

  /**
   * Check risk without full login flow
   */
  async checkRisk(payload?: Partial<LoginPayload>): Promise<RiskResponse> {
    try {
      this.logger.log("Checking risk");

      // Use minimal payload if not provided
      const loginPayload: LoginPayload = {
        userId: payload?.userId || "anonymous",
        email: payload?.email || "anonymous@aegis.local",
        metadata: payload?.metadata,
        simulateFlags: payload?.simulateFlags,
      };

      const fingerprint = collectFingerprint();
      const assessmentPayload: RiskAssessmentPayload = {
        ...loginPayload,
        fingerprint,
      };

      const response = await withRetry(
        async () => {
          return withTimeout(
            this.client.post<RiskResponse>(
              `${this.endpoint}/predict/risk`,
              assessmentPayload
            ),
            this.timeout
          );
        },
        this.retries
      );

      const risk: RiskResponse = response.data;

      if (!this.validateRiskResponse(risk)) {
        throw new InvalidResponseError("Invalid risk response from backend", risk);
      }

      if (!risk.timestamp) {
        risk.timestamp = Date.now();
      }

      this.cachedRisk = risk;
      return risk;
    } catch (error) {
      this.logger.error("checkRisk failed", error);
      return this.handleError(error);
    }
  }

  /**
   * Start continuous session monitoring
   */
  startMonitoring(handler: MonitoringCallback): string {
    if (isMonitoring()) {
      this.logger.log("Monitoring already active");
      return this.monitoringId || "unknown";
    }

    this.monitoringId = generateRequestId();

    this.logger.log("Starting session monitoring", {
      interval: this.monitorInterval,
      monitoringId: this.monitoringId,
    });

    startSessionMonitoring(this.monitorInterval, async () => {
      try {
        const risk = await this.checkRisk();
        handler(risk);
      } catch (error) {
        this.logger.error("Monitoring check failed", error);
      }
    });

    return this.monitoringId;
  }

  /**
   * Stop continuous session monitoring
   */
  stopMonitoring(): void {
    if (!isMonitoring()) {
      this.logger.log("Monitoring not active");
      return;
    }

    this.logger.log("Stopping session monitoring", {
      monitoringId: this.monitoringId,
    });

    stopSessionMonitoring();
    this.monitoringId = null;
  }

  /**
   * Check if risk is HIGH or CRITICAL
   */
  isHighRisk(risk: RiskResponse): boolean {
    return risk.risk_level === "HIGH" || risk.risk_level === "CRITICAL";
  }

  /**
   * Check if risk is CRITICAL
   */
  isCritical(risk: RiskResponse): boolean {
    return risk.risk_level === "CRITICAL";
  }

  /**
   * Check if risk is LOW
   */
  isLowRisk(risk: RiskResponse): boolean {
    return risk.risk_level === "LOW";
  }

  /**
   * Check if fingerprint changed significantly
   */
  hasDeviceChanged(): boolean {
    if (!this.lastFingerprint) return false;

    const currentFingerprint = collectFingerprint();
    return !compareFingerprints(this.lastFingerprint, currentFingerprint);
  }

  /**
   * Get last cached risk assessment
   */
  getCachedRisk(): RiskResponse | null {
    return this.cachedRisk;
  }

  /**
   * Get current monitoring status
   */
  getMonitoringStatus(): boolean {
    return isMonitoring();
  }

  /**
   * Validate risk response structure
   */
  private validateRiskResponse(response: any): response is RiskResponse {
    if (!response || typeof response !== "object") {
      return false;
    }

    const validRiskLevels: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    return (
      typeof response.risk_score === "number" &&
      response.risk_score >= 0 &&
      response.risk_score <= 1 &&
      validRiskLevels.includes(response.risk_level) &&
      typeof response.components === "object"
    );
  }

  /**
   * Handle errors with fallback strategy
   */
  private handleError(error: any): RiskResponse {
    this.logger.error("Error handled with fallback", error);

    // Fallback to LOW risk with warning if backend is unreachable
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        // Network error
        console.warn(
          "[AegisAuth] Backend unreachable, using LOW risk fallback"
        );
        return {
          risk_score: 0.2,
          risk_level: "LOW",
          components: { fallback: 1 },
          timestamp: Date.now(),
        };
      }

      if (error.response.status >= 500) {
        // Server error
        console.warn(
          "[AegisAuth] Backend error, using LOW risk fallback"
        );
        return {
          risk_score: 0.2,
          risk_level: "LOW",
          components: { fallback: 1 },
          timestamp: Date.now(),
        };
      }

      // Other HTTP errors
      const status = error.response.status;
      throw new NetworkError(
        `Risk assessment failed: ${error.message}`,
        status
      );
    }

    // Timeout error
    if (error instanceof Error && error.message.includes("timeout")) {
      throw new TimeoutError(
        `Risk assessment timed out after ${this.timeout}ms`,
        this.timeout
      );
    }

    throw new AegisError(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopMonitoring();
    this.lastFingerprint = null;
    this.cachedRisk = null;
    this.logger.log("AegisAuth client destroyed");
  }
}
