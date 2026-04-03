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

      // Decision Execution (Single Authority)
      if (risk.decision) {
        const { type, reason_codes } = risk.decision;
        
        if (type === "BLOCK") {
          return res.status(403).json({
            error: "Access denied",
            message: "Decision Engine: Blocked",
            reasons: reason_codes,
          });
        }

        if (type === "RESTRICT" || type === "CHALLENGE") {
          res.setHeader("X-Aegis-Decision", type);
          res.setHeader("X-Aegis-Actions", JSON.stringify(risk.decision.required_actions));
        }
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
export function requireLowRisk() {
  return (req: any, res: any, next: any) => {
    const risk = (req as AegisRequest).aegisRisk;

    if (!risk) {
      return res.status(400).json({
        error: "Risk assessment required",
        message: "Run aegisMiddleware first",
      });
    }

    if (risk.decision?.type === "BLOCK" || risk.decision?.type === "RESTRICT") {
      return res.status(429).json({
        error: "Access restricted by Decision Engine",
        message: "Please verify your identity",
        decision: risk.decision?.type,
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
