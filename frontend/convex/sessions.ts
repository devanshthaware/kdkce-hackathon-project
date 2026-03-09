import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const list = query({
    args: { applicationId: v.optional(v.id("applications")) },
    handler: async (ctx, args) => {
        if (args.applicationId) {
            return await ctx.db
                .query("sessions")
                .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId!))
                .order("desc")
                .collect();
        }
        // For general dashboard, we might want to list all sessions user has access to
        // This requires a join or filtering, for now just returning all (simplified)
        return await ctx.db.query("sessions").order("desc").collect();
    },
});

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const sessions = await ctx.db.query("sessions").collect();
        const apps = await ctx.db.query("applications").collect();

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
        const sessions = await ctx.db.query("sessions").collect();

        // Mocking some time-based distribution for now since we don't have historical data in the schema yet
        // In a real app, we'd query by timestamp
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const riskDist = days.map(day => ({
            day,
            low: Math.floor(Math.random() * 50) + 100,
            medium: Math.floor(Math.random() * 30) + 40,
            high: Math.floor(Math.random() * 15) + 5,
            critical: Math.floor(Math.random() * 5),
        }));

        const deviceTrust = days.map(day => ({
            day,
            trusted: 80 + Math.floor(Math.random() * 15),
            unknown: 5 + Math.floor(Math.random() * 10),
            untrusted: Math.floor(Math.random() * 5),
        }));

        const hourlyRiskDist = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"].map(hour => ({
            hour,
            low: Math.floor(Math.random() * 100),
            medium: Math.floor(Math.random() * 40),
            high: Math.floor(Math.random() * 15),
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
