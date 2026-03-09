import axios, { AxiosInstance } from "axios";
import { RiskResponse, LoginPayload, AegisConfig } from "../types";
import { validateConfig, createLogger, withRetry, withTimeout } from "../utils";
import { NetworkError, InvalidResponseError, ConfigError, TimeoutError } from "../errors";

/**
 * Server-side AegisAuth client for Node.js environments
 * Simplified version without device fingerprinting
 * Used for backend-to-backend risk evaluation
 */
export class AegisAuthNode {
  private apiKey: string;
  private endpoint: string;
  private timeout: number;
  private retries: number;
  private client: AxiosInstance;
  private logger: ReturnType<typeof createLogger>;

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
    this.timeout = config.timeout ?? 10000;
    this.retries = config.retries ?? 1;
    this.logger = createLogger(config.debug ?? false);

    // Initialize axios client
    this.client = axios.create({
      timeout: this.timeout,
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
        "User-Agent": "aegis-auth-node/1.0.0",
      },
    });

    this.logger.log("AegisAuthNode client initialized", {
      endpoint: this.endpoint,
    });
  }

  /**
   * Evaluate risk for a user request
   */
  async evaluateRisk(payload: Partial<LoginPayload> & Record<string, any>): Promise<RiskResponse> {
    try {
      this.logger.log("Evaluating risk", { userId: payload.userId });

      const response = await withRetry(
        async () => {
          return withTimeout(
            this.client.post<RiskResponse>(
              `${this.endpoint}/predict/risk`,
              payload
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

      return risk;
    } catch (error) {
      this.logger.error("evaluateRisk failed", error);
      throw this.handleError(error);
    }
  }

  /**
   * Batch evaluate multiple risk assessments
   */
  async evaluateRiskBatch(payloads: Array<Partial<LoginPayload> & Record<string, any>>): Promise<RiskResponse[]> {
    return Promise.all(payloads.map((p) => this.evaluateRisk(p)));
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
   * Validate risk response
   */
  private validateRiskResponse(response: any): response is RiskResponse {
    if (!response || typeof response !== "object") {
      return false;
    }

    const validRiskLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    return (
      typeof response.risk_score === "number" &&
      response.risk_score >= 0 &&
      response.risk_score <= 1 &&
      validRiskLevels.includes(response.risk_level) &&
      typeof response.components === "object"
    );
  }

  /**
   * Handle errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        return new NetworkError(
          `Network error: ${error.message}`,
          undefined
        );
      }

      return new NetworkError(
        `Risk evaluation failed: ${error.message}`,
        error.response.status
      );
    }

    if (error instanceof Error && error.message.includes("timeout")) {
      return new TimeoutError(
        `Risk evaluation timed out after ${this.timeout}ms`,
        this.timeout
      );
    }

    return error instanceof Error
      ? error
      : new Error("Unknown error occurred");
  }
}
