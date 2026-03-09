import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const list = query({
    args: { applicationId: v.optional(v.id("applications")) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const userId = identity.subject;

        // Fetch owned applications
        const apps = await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        const appIds = new Set(apps.map((app) => app._id.toString()));

        if (args.applicationId) {
            // Verify ownership explicitly if requesting a specific app
            if (!appIds.has(args.applicationId.toString())) {
                throw new Error("Unauthorized access to this application");
            }

            return await ctx.db
                .query("sessions")
                .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId!))
                .order("desc")
                .collect();
        }

        // Fetch all sessions for owned apps
        let sessions = [];
        for (const app of apps) {
            const appSessions = await ctx.db
                .query("sessions")
                .withIndex("by_application", (q) => q.eq("applicationId", app._id))
                .order("desc")
                .take(50); // limit per app
            sessions.push(...appSessions);
        }

        // Return combined sessions sorted locally
        return sessions.sort((a, b) => b.loginTime - a.loginTime).slice(0, 100);
    },
});

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return { totalSessions: 0, highRiskAlerts: 0, activeApps: 0, avgRiskScore: 0 };

        const userId = identity.subject;

        // Fetch owned applications
        const apps = await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        let sessions = [];
        for (const app of apps) {
            const appSessions = await ctx.db
                .query("sessions")
                .withIndex("by_application", (q) => q.eq("applicationId", app._id))
                .collect();
            sessions.push(...appSessions);
        }

        const highRisk = sessions.filter(s => s.status === "suspicious" || s.status === "blocked").length;
        const avgRisk = sessions.length > 0
            ? sessions.reduce((acc, s) => acc + s.riskScore, 0) / sessions.length
            : 0;

        return {
            totalSessions: sessions.length,
            highRiskAlerts: highRisk,
            activeApps: apps.filter(a => a.status === "Active").length,
            avgRiskScore: parseFloat(avgRisk.toFixed(1)),
        };
    },
});

export const getAnalytics = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const userId = identity.subject;

        // Fetch owned applications
        const apps = await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        let sessions = [];
        for (const app of apps) {
            const appSessions = await ctx.db
                .query("sessions")
                .withIndex("by_application", (q) => q.eq("applicationId", app._id))
                .collect();
            sessions.push(...appSessions);
        }

        // Mocking some time-based distribution for now since we don't have historical data in the schema yet
        // We tie the volumes to actual valid user session count for realism
        const baseVolume = sessions.length > 0 ? (sessions.length / 10) : 0; 

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const riskDist = days.map(day => ({
            day,
            low: Math.floor(Math.random() * baseVolume * 0.7) + (sessions.length > 0 ? 2 : 0),
            medium: Math.floor(Math.random() * baseVolume * 0.2) + (sessions.length > 0 ? 1 : 0),
            high: Math.floor(Math.random() * baseVolume * 0.08),
            critical: Math.floor(Math.random() * baseVolume * 0.02),
        }));

        const deviceTrust = days.map(day => ({
            day,
            trusted: Math.floor(baseVolume * 0.85) + Math.floor(Math.random() * 5),
            unknown: Math.floor(baseVolume * 0.1) + Math.floor(Math.random() * 2),
            untrusted: Math.floor(baseVolume * 0.05),
        }));

        const hourlyRiskDist = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"].map(hour => ({
            hour,
            low: Math.floor(Math.random() * baseVolume * 0.6),
            medium: Math.floor(Math.random() * baseVolume * 0.2),
            high: Math.floor(Math.random() * baseVolume * 0.1),
        }));

        return {
            riskDist,
            deviceTrust,
            hourlyRiskDist,
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
        riskScore: v.number(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const app = await ctx.db.get(args.applicationId);

        const sessionId = await ctx.db.insert("sessions", {
            ...args,
            loginTime: Date.now(),
        });

        // Also log to activities
        await ctx.db.insert("activities", {
            applicationId: args.applicationId,
            userEmail: args.userEmail,
            action: "Login Attempt",
            device: args.device,
            location: args.location,
            risk: args.status,
            timestamp: Date.now(),
        });

        // Trigger ML assessment if enabled
        if (app?.mlEnhancement) {
            await ctx.scheduler.runAfter(0, (api as any).ml.assessRisk, {
                sessionId,
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
        riskScore: v.number(),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) return;

        await ctx.db.patch(args.sessionId, {
            riskScore: args.riskScore,
            status: args.status,
        });

        // Also log the update as an activity
        await ctx.db.insert("activities", {
            applicationId: session.applicationId,
            userEmail: session.userEmail,
            action: "Risk Update",
            device: session.device,
            location: session.location,
            risk: args.status,
            timestamp: Date.now(),
        });
    },
});
