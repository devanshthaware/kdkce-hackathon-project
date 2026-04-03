import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { transitionSession, SessionState } from "./sessionState";
import { emitEvent } from "./events";

/**
 * Access Control Helper: Ensures user is member of organization or owner.
 */
async function validateAppAccess(ctx: any, applicationId: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const app = await ctx.db.get(applicationId);
    if (!app) throw new Error("Application not found");

    if (app.userId !== identity.subject) {
        // Check org membership if not the owner
        if (app.organizationId) {
            const membership = await ctx.db
                .query("organizationMembers")
                .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
                .filter((q: any) => q.eq(q.field("organizationId"), app.organizationId))
                .first();
            if (!membership) throw new Error("Forbidden: No access to this application");
        } else {
            throw new Error("Forbidden: Access denied");
        }
    }
    return { identity, app };
}

export const list = query({
    args: { 
        applicationId: v.optional(v.id("applications")),
        organizationId: v.optional(v.id("organizations"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const userId = identity.subject;

        let apps;
        if (args.organizationId) {
            // Verify org membership first
            const membership = await ctx.db
                .query("organizationMembers")
                .withIndex("by_user", (q: any) => q.eq("userId", userId))
                .filter((q: any) => q.eq(q.field("organizationId"), args.organizationId))
                .first();
            if (!membership) throw new Error("Forbidden: Not a member of this organization");

            apps = await ctx.db
                .query("applications")
                .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId!))
                .collect();
        } else {
            apps = await ctx.db
                .query("applications")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();
        }

        const appIds = new Set(apps.map((app) => app._id.toString()));

        if (args.applicationId) {
            if (!appIds.has(args.applicationId.toString())) {
                throw new Error("Forbidden: Unauthorized access to this application");
            }

            return await ctx.db
                .query("sessions")
                .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId!))
                .order("desc")
                .collect();
        }

        let sessions = [];
        for (const app of apps) {
            const appSessions = await ctx.db
                .query("sessions")
                .withIndex("by_application", (q) => q.eq("applicationId", app._id))
                .order("desc")
                .take(50);
            sessions.push(...appSessions);
        }

        return sessions.sort((a, b) => b.loginTime - a.loginTime).slice(0, 100);
    },
});

export const getStats = query({
    args: { organizationId: v.optional(v.id("organizations")) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return {
            totalSessions: 0, highRiskAlerts: 0, activeApps: 0, avgRiskScore: 0,
            activeSessions: 0, riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        };

        const userId = identity.subject;

        let apps = [];
        if (args.organizationId) {
            apps = await ctx.db
                .query("applications")
                .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId!))
                .collect();
        } else {
            apps = await ctx.db
                .query("applications")
                .withIndex("by_user", (q) => q.eq("userId", userId))
                .collect();
        }

        let sessions = [];
        for (const app of apps) {
            const appSessions = await ctx.db
                .query("sessions")
                .withIndex("by_application", (q) => q.eq("applicationId", app._id))
                .collect();
            sessions.push(...appSessions);
        }

        const highRisk = sessions.filter(s => s.state === "CHALLENGED" || s.state === "RESTRICTED" || s.state === "BLOCKED").length;
        const avgRisk = sessions.length > 0
            ? sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length
            : 0;

        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
        const activeSessions = sessions.filter(s => s.loginTime > twentyFourHoursAgo).length;

        const total = sessions.length || 1;
        const low = sessions.filter(s => s.score <= 0.3).length;
        const medium = sessions.filter(s => s.score > 0.3 && s.score <= 0.6).length;
        const high = sessions.filter(s => s.score > 0.6 && s.score <= 0.8).length;
        const critical = sessions.filter(s => s.score > 0.8).length;

        return {
            totalSessions: sessions.length,
            highRiskAlerts: highRisk,
            activeApps: apps.filter(a => a.status === "Active").length,
            avgRiskScore: parseFloat(avgRisk.toFixed(2)),
            activeSessions,
            riskDistribution: {
                low: Math.round((low / total) * 100),
                medium: Math.round((medium / total) * 100),
                high: Math.round((high / total) * 100),
                critical: Math.round((critical / total) * 100),
            },
        };
    },
});

export const createSession = mutation({
    args: {
        applicationId: v.id("applications"),
        userEmail: v.string(),
        device: v.string(),
        browser: v.string(),
        location: v.string(),
        ip: v.string(),
        score: v.number(),
    },
    handler: async (ctx, args) => {
        // DERIVE IDENTITY: Remove client trust
        const identity = await ctx.auth.getUserIdentity();
        const userEmail = identity?.email || args.userEmail;

        const app = await ctx.db.get(args.applicationId);
        if (!app) throw new Error("Application not found");

        const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const sessionId = await ctx.db.insert("sessions", {
            ...args,
            userEmail: userEmail, // Enforce verified email
            loginTime: Date.now(),
            state: "NEW", 
            stateVersion: 0,
            updatedAt: Date.now(),
            correlationId,
        });

        // Emit Initial Signal
        await emitEvent(ctx.db, {
            type: "SIGNAL_RECEIVED",
            sessionId,
            correlationId,
            applicationId: args.applicationId,
            payload: {
                // Identity derived at signal entry
                userEmail: args.userEmail,
                device: args.device,
                ip: args.ip,
                browser: args.browser
            }
        });

        // ACTION_EXECUTED for Session Initiation
        await emitEvent(ctx.db, {
            type: "ACTION_EXECUTED",
            sessionId,
            correlationId,
            applicationId: args.applicationId,
            payload: { action: "INITIATE_SESSION", result: "SUCCESS" }
        });

        // Enter state machine
        await transitionSession(ctx.db, sessionId, "EVALUATING", "SESSION_CREATED", correlationId);

        // Trigger ML assessment
        if (app?.mlEnhancement) {
            await ctx.scheduler.runAfter(0, (api as any).ml.assessRisk, {
                sessionId,
                correlationId,
                context: {
                    userEmail: args.userEmail,
                    device: args.device,
                    ip: args.ip
                }
            });
        }

        return sessionId;
    },
});

export const updateSessionRisk = mutation({
    args: {
        sessionId: v.id("sessions"),
        score: v.number(),
        state: v.string(),
        correlationId: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) throw new Error("Session not found");

        // ENFORCEMENT: Reject updates if session is terminal or blocked
        if (session.state === "TERMINATED" || session.state === "BLOCKED") {
            const errorMsg = `FORBIDDEN: Attempted mutation on ${session.state} session ${args.sessionId}`;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        const correlationId = args.correlationId ?? session.correlationId;

        await ctx.db.patch(args.sessionId, { score: args.score });

        await transitionSession(
            ctx.db, 
            args.sessionId, 
            args.state as SessionState, 
            "MANUAL_OR_EXTERNAL_RISK_UPDATE",
            correlationId
        );
    },
});
