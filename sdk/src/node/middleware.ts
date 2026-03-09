import { AegisAuthNode } from "./client";
import { RiskResponse, AegisConfig } from "../types";

/**
 * Express/Node.js middleware for AegisAuth
 * Attaches risk assessment to request object
 */
export type AegisRequest = Request & {
  aegisRisk?: RiskResponse;
  aegisUserId?: string;
};

/**
 * Create AegisAuth middleware
 */
export function createAegisMiddleware(client: AegisAuthNode) {
  return async (
    req: any,
    res: any,
    next: any
  ): Promise<void> => {
    try {
      // Extract user context from request
      const userId = req.body?.userId || req.user?.id || "anonymous";
      const email = req.body?.email || req.user?.email || "anonymous@aegis.local";

      // Evaluate risk
      const risk = await client.evaluateRisk({
        userId,
        email,
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          path: req.path,
          method: req.method,
        },
      });

      // Attach risk to request
      (req as AegisRequest).aegisRisk = risk;
      (req as AegisRequest).aegisUserId = userId;

      // Block if critical
      if (client.isCritical(risk)) {
        return res.status(403).json({
          error: "Access denied",
          message: "Critical risk detected",
          riskLevel: risk.risk_level,
        });
      }

      // Warn if high risk
      if (client.isHighRisk(risk)) {
        res.setHeader("X-Aegis-Risk-Level", risk.risk_level);
        // Handler can check this header to enforce MFA
      }

      next();
    } catch (error) {
      // Fail open for middleware errors
      console.error("[AegisAuth Middleware] Error:", error);
      next();
    }
  };
}

/**
 * Middleware factory function
 */
export function aegisMiddleware(config: AegisConfig) {
  const client = new AegisAuthNode(config);
  return createAegisMiddleware(client);
}

/**
 * Decorator for protecting Express routes
 */
export function requireLowRisk(client: AegisAuthNode) {
  return (req: any, res: any, next: any) => {
    const risk = (req as AegisRequest).aegisRisk;

    if (!risk) {
      return res.status(400).json({
        error: "Risk assessment required",
        message: "Run aegisMiddleware first",
      });
    }

    if (client.isHighRisk(risk)) {
      return res.status(429).json({
        error: "Anomalous activity detected",
        message: "Please verify your identity",
        riskLevel: risk.risk_level,
      });
    }

    next();
  };
}

/**
 * Error handling middleware
 */
export function aegisErrorHandler() {
  return (error: any, _req: any, res: any, _next: any) => {
    console.error("[AegisAuth Error]", error);

    // Don't leak internal error details
    res.status(500).json({
      error: "Authentication service error",
      message: "Please try again",
    });
  };
}
