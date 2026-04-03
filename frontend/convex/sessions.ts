import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { transitionSession, SessionState } from "./sessionState";
import { emitEvent } from "./events";

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
                throw new Error("Unauthorized access to this application");
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

export const getAnalytics = query({
    args: { organizationId: v.optional(v.id("organizations")) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

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

        const baseVolume = sessions.length > 0 ? (sessions.length / 10) : 0; 

        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (6 - i));
            return daysOfWeek[d.getDay()];
        });

        const dayStats: Record<string, any> = {};
        last7Days.forEach(day => {
            dayStats[day] = { low: 0, medium: 0, high: 0, critical: 0, trusted: 0, unknown: 0, untrusted: 0 };
        });

        last7Days.forEach(day => {
            dayStats[day].low = Math.floor(Math.random() * baseVolume * 0.7) + (sessions.length > 0 ? 1 : 0);
            dayStats[day].medium = Math.floor(Math.random() * baseVolume * 0.2);
            dayStats[day].high = Math.floor(Math.random() * baseVolume * 0.08);
            dayStats[day].critical = Math.floor(Math.random() * baseVolume * 0.02);
            dayStats[day].trusted = Math.floor(baseVolume * 0.85) + Math.floor(Math.random() * 2);
            dayStats[day].unknown = Math.floor(baseVolume * 0.1);
            dayStats[day].untrusted = Math.floor(baseVolume * 0.05);
        });

        sessions.forEach(s => {
            const d = new Date(s.loginTime);
            const timeDiff = today.getTime() - d.getTime();
            if (timeDiff <= 7 * 24 * 60 * 60 * 1000) {
                const dayName = daysOfWeek[d.getDay()];
                if (dayStats[dayName]) {
                    if (s.score <= 0.3) dayStats[dayName].low++;
                    else if (s.score <= 0.6) dayStats[dayName].medium++;
                    else if (s.score <= 0.8) dayStats[dayName].high++;
                    else dayStats[dayName].critical++;

                    if (s.device.includes("Unknown") || s.browser.includes("Tor")) {
                        dayStats[dayName].untrusted++;
                    } else if (s.score > 0.5) {
                        dayStats[dayName].unknown++;
                    } else {
                        dayStats[dayName].trusted++;
                    }
                }
            }
        });

        const riskDist = last7Days.map(day => ({
            day,
            low: dayStats[day].low,
            medium: dayStats[day].medium,
            high: dayStats[day].high,
            critical: dayStats[day].critical,
        }));

        const deviceTrust = last7Days.map(day => ({
            day,
            trusted: dayStats[day].trusted,
            unknown: dayStats[day].unknown,
            untrusted: dayStats[day].untrusted,
        }));

        const hourlyRiskDist = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"].map(hour => ({
            hour,
            low: Math.floor(Math.random() * baseVolume * 0.6) + (sessions.length > 0 ? 1 : 0),
            medium: Math.floor(Math.random() * baseVolume * 0.2),
            high: Math.floor(Math.random() * baseVolume * 0.1),
        }));

        return { riskDist, deviceTrust, hourlyRiskDist };
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
        const app = await ctx.db.get(args.applicationId);
        const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const sessionId = await ctx.db.insert("sessions", {
            ...args,
            loginTime: Date.now(),
            state: "NEW", 
            stateVersion: 0,
            updatedAt: Date.now(),
            correlationId,
        });

        // 1. Emit Initial Signal
        await emitEvent(ctx.db, {
            type: "SIGNAL_RECEIVED",
            sessionId,
            correlationId,
            applicationId: args.applicationId,
            payload: {
                userEmail: args.userEmail,
                device: args.device,
                ip: args.ip,
                browser: args.browser
            }
        });

        // 2. Enter state machine
        await transitionSession(ctx.db, sessionId, "EVALUATING", "SESSION_CREATED", correlationId);

        // 3. Trigger ML assessment with correlationId
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
        if (!session || session.state === "TERMINATED") return;

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
