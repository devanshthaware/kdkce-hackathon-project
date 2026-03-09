import { v } from "convex/values";
import { query } from "./_generated/server";

export const getDashboardSummary = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        // Fetch owned applications
        const apps = await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        // Fetch all sessions for owned apps
        let sessions = [];
        for (const app of apps) {
            const appSessions = await ctx.db
                .query("sessions")
                .withIndex("by_application", (q) => q.eq("applicationId", app._id))
                .order("desc")
                .take(100);
            sessions.push(...appSessions);
        }

        const highRisk = sessions.filter((s) =>
            s.status === "suspicious" || s.status === "blocked" ||
            s.riskScore >= 70
        ).length;

        const avgRisk = sessions.length > 0
            ? sessions.reduce((acc, s) => acc + s.riskScore, 0) / sessions.length
            : 0;

        return {
            totalSessions: sessions.length,
            highRiskAlerts: highRisk,
            activeApps: apps.filter((a) => a.status === "Active").length,
            avgRiskScore: parseFloat(avgRisk.toFixed(1)),
        };
    },
});

export const getCriticalAlerts = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        // Fetch owned applications
        const apps = await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        let alerts = [];
        for (const app of apps) {
            const appActivities = await ctx.db
                .query("activities")
                .withIndex("by_application", (q) => q.eq("applicationId", app._id))
                .order("desc")
                .take(50);

            // Filter for high/critical activities
            const criticalActivities = appActivities.filter(
                (a) => a.risk === "high" || a.risk === "critical" || a.risk === "suspicious" || a.risk === "blocked"
            );
            alerts.push(...criticalActivities);
        }

        return alerts.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    },
});
