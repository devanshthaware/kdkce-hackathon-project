import { v } from "convex/values";

/**
 * AEGIS DECISION ENGINE
 * Single authority for risk-to-decision mapping.
 */

export type DecisionType = "ALLOW" | "CHALLENGE" | "RESTRICT" | "BLOCK";

export interface Decision {
    type: DecisionType;
    reason_codes: string[];
    required_actions: DecisionAction[];
}

export interface DecisionAction {
    type: "MFA_REQUIRED" | "SESSION_TERMINATE" | "ACCESS_RESTRICT" | "NONE";
    payload?: Record<string, any>;
}

/**
 * Centralized mapping of risk score and level to decision and action.
 */
export function evaluateDecision(riskScore: number, riskLevel: string): Decision {
    // Canonical mapping as per system model
    if (riskScore >= 0.8 || riskLevel === "CRITICAL") {
        return {
            type: "BLOCK",
            reason_codes: ["CRITICAL_RISK_DETECTED"],
            required_actions: [{ type: "SESSION_TERMINATE" }]
        };
    }

    if (riskScore >= 0.6 || riskLevel === "HIGH") {
        return {
            type: "RESTRICT",
            reason_codes: ["HIGH_RISK_DETECTED"],
            required_actions: [{ type: "ACCESS_RESTRICT", payload: { mode: "readonly" } }]
        };
    }

    if (riskScore >= 0.3 || riskLevel === "MEDIUM") {
        return {
            type: "CHALLENGE",
            reason_codes: ["ANOMALOUS_BEHAVIOR"],
            required_actions: [{ type: "MFA_REQUIRED" }]
        };
    }

    // Default: LOW Risk
    return {
        type: "ALLOW",
        reason_codes: ["LOW_RISK_VERIFIED"],
        required_actions: [{ type: "NONE" }]
    };
}
