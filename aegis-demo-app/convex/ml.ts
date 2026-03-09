import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const assessRisk = action({
    args: {
        sessionId: v.id("sessions"),
        // In a real scenario, we'd pass more context from the request
        context: v.any(),
    },
    handler: async (ctx, args) => {
        // 1. Fetch session data if needed (actions can call queries)
        // For now we'll construct a mock request based on the identified schema
        const mlUrl = process.env.ML_BACKEND_URL || "http://localhost:8000";

        const requestBody = {
            login: {
                username: "user@example.com", // This would come from session/context
                ip_address: "192.168.1.1",
                user_agent: "Mozilla/5.0...",
                login_timestamp: new Date().toISOString(),
            },
            session: {
                session_id: args.sessionId,
                api_calls_per_min: 12.5,
                sensitive_endpoint_access: 0,
                session_duration_minutes: 5.0,
                request_entropy: 3.2,
                data_download_mb: 1.2,
                token_reuse_flag: 0,
            },
            device: {
                device_id: "dev_123",
                successful_logins: 50,
                failed_attempts: 1,
                mfa_failures: 0,
                device_age_days: 90,
                days_since_last_seen: 0,
                past_anomaly_count: 0,
                credential_stuffing_pattern_flag: 0,
            },
            baseline: {
                avg_login_velocity: 1.5,
                avg_api_calls_per_min: 10.0,
                ip_reputation_score: 0.9,
            },
            global_threat: {
                active_botnets_count: 5,
                recent_data_breach_events: 1,
                global_anomaly_index: 0.2,
            },
            rule_based_score: 10.0,
        };

        try {
            const response = await fetch(`${mlUrl}/predict/risk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error(`ML Backend responded with ${response.status}`);
            }

            const result = await response.json();

            // 2. Sync results back to the database
            await ctx.runMutation(api.ml.syncMLResults, {
                sessionId: args.sessionId,
                riskScore: result.risk_score,
                status: result.risk_level.toLowerCase(),
            });

            return result;
        } catch (error) {
            console.error("ML Risk Assessment failed:", error);
            // Fallback or report error
            return null;
        }
    },
});

export const syncMLResults = mutation({
    args: {
        sessionId: v.id("sessions"),
        riskScore: v.number(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.sessionId, {
            riskScore: args.riskScore,
            status: args.status,
        });
    },
});
