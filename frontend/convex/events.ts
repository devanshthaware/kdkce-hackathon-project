import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { GenericDatabaseWriter } from "convex/server";

export type AegisEventType = 
    | "SIGNAL_RECEIVED" 
    | "RISK_CALCULATED" 
    | "DECISION_MADE" 
    | "ACTION_DISPATCHED" 
    | "ACTION_EXECUTED" 
    | "ACTION_FAILED"
    | "STATE_TRANSITIONED";

/**
 * Structured event for the AegisAuth pipeline.
 * Enforcement: Append-only, Idempotent (Correlation + Type)
 */
export async function emitEvent(
    db: GenericDatabaseWriter<any>,
    params: {
        type: AegisEventType;
        sessionId: Id<"sessions">;
        correlationId: string;
        applicationId: Id<"applications">;
        payload: any;
    }
): Promise<Id<"events">> {
    // 1. Idempotency Protection: (correlation_id + event_type) uniqueness
    const existing = await db
        .query("events")
        .withIndex("by_correlation", (q) => q.eq("correlationId", params.correlationId))
        .filter((q) => q.eq(q.field("type"), params.type))
        .first();
    
    if (existing) {
        console.warn(`[Aegis Event System] Duplicate event suppressed: ${params.type} for correlation ${params.correlationId}`);
        return existing._id;
    }

    // 2. Append-only: Handled by Convex (no update/delete methods exposed for events table in public mutations)
    const eventId = await db.insert("events", {
        ...params,
        timestamp: Date.now(),
    });

    console.log(`[Aegis Event] ${params.type} | Session: ${params.sessionId} | Correlation: ${params.correlationId}`);
    return eventId;
}

export const getLifecycle = query({
  args: { 
    sessionId: v.optional(v.id("sessions")),
    correlationId: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    // Basic Auth Check: Ensure user is logged in
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    if (args.correlationId) {
      return await ctx.db
        .query("events")
        .withIndex("by_correlation", (q) => q.eq("correlationId", args.correlationId!))
        .order("asc")
        .collect();
    }
    if (args.sessionId) {
      return await ctx.db
        .query("events")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId!))
        .order("asc")
        .collect();
    }
    return [];
  },
});
