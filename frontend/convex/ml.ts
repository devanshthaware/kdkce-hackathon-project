import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { evaluateDecision, DecisionType } from "./decisions";
import { transitionSession, SessionState } from "./sessionState";
import { emitEvent } from "./events";

export const assessRisk = action({
    args: {
        sessionId: v.id("sessions"),
        correlationId: v.string(),
        context: v.any(),
    },
    handler: async (ctx, args) => {
        const mlUrl = process.env.ML_BACKEND_URL || "http://localhost:8000";

        // Structured ML request payload
        const requestBody = {
            login: {
                username: args.context.userEmail || "user@example.com",
                ip_address: args.context.ip || "192.168.1.1",
                user_agent: "AegisAuth-SDK/1.0",
                login_timestamp: new Date().toISOString(),
                correlation_id: args.correlationId,
            },
            session: { session_id: args.sessionId },
            device: { device_id: args.context.device || "dev_unknown" }
        };

        try {
            const response = await fetch(`${mlUrl}/predict/risk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error(`ML Backend responded with ${response.status}`);

            const result = await response.json();
            
            // 2. Sync results and trigger downstream events via mutation
            const decision = evaluateDecision(result.risk_score, result.risk_level);

            const stateMap: Record<DecisionType, SessionState> = {
                ALLOW: "ACTIVE",
                CHALLENGE: "CHALLENGED",
                RESTRICT: "RESTRICTED",
                BLOCK: "BLOCKED"
            };

            await ctx.runMutation(api.ml.syncMLResults, {
                sessionId: args.sessionId,
                correlationId: args.correlationId,
                score: result.risk_score,
                state: stateMap[decision.type],
                decisionType: decision.type,
                riskResult: result
            });

            return { ...result, decision };
        } catch (error) {
            console.error("ML Risk Assessment failed:", error);
            return null;
        }
    },
});

export const syncMLResults = mutation({
    args: {
        sessionId: v.id("sessions"),
        correlationId: v.string(),
        score: v.number(),
        state: v.string(),
        decisionType: v.string(),
        riskResult: v.any(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session || session.state === "TERMINATED") return;

        // 1. Emit RISK_CALCULATED
        await emitEvent(ctx.db, {
            type: "RISK_CALCULATED",
            sessionId: args.sessionId,
            correlationId: args.correlationId,
            applicationId: session.applicationId,
            payload: args.riskResult
        });

        // 2. Emit DECISION_MADE
        await emitEvent(ctx.db, {
            type: "DECISION_MADE",
            sessionId: args.sessionId,
            correlationId: args.correlationId,
            applicationId: session.applicationId,
            payload: {
                decision: args.decisionType,
                target_state: args.state
            }
        });

        // 3. Emit ACTION_DISPATCHED
        await emitEvent(ctx.db, {
            type: "ACTION_DISPATCHED",
            sessionId: args.sessionId,
            correlationId: args.correlationId,
            applicationId: session.applicationId,
            payload: {
                dispatched_at: Date.now(),
                context: "ML_ORCHESTRATED_DECISION"
            }
        });

        // 4. Persist score and transition state
        await ctx.db.patch(args.sessionId, { score: args.score });

        await transitionSession(
            ctx.db, 
            args.sessionId, 
            args.state as SessionState, 
            "ML_ASSESSMENT_COMPLETED",
            args.correlationId
        );
    },
});
