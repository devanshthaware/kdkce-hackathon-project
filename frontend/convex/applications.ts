import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .collect();
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        environment: v.string(),
        riskPolicyId: v.id("riskPolicies"),
        type: v.string(),
        redirectUri: v.optional(v.string()),
        mlEnhancement: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const appId = `app_${Math.random().toString(36).substring(2, 8)}`;
        const apiKey = `ak_live_${Math.random().toString(36).substring(2, 10)}`;
        const secret = `sk_live_${Math.random().toString(36).substring(2, 10)}`;

        return await ctx.db.insert("applications", {
            ...args,
            status: "Active",
            appId,
            apiKey,
            secret,
            userId: identity.subject,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("applications"),
        name: v.string(),
        environment: v.string(),
        riskPolicyId: v.id("riskPolicies"),
    },
    handler: async (ctx, args) => {
        const { id, ...data } = args;
        await ctx.db.patch(id, data);
    },
});

export const toggleStatus = mutation({
    args: { id: v.id("applications") },
    handler: async (ctx, args) => {
        const app = await ctx.db.get(args.id);
        if (!app) throw new Error("Application not found");
        await ctx.db.patch(args.id, {
            status: app.status === "Active" ? "Inactive" : "Active",
        });
    },
});

export const getOrCreateDemoApp = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .filter((q) => q.eq("name", "Demo Application"))
            .first();

        if (existing) return existing;

        // Create a default risk policy if none exists
        let policy = await ctx.db
            .query("riskPolicies")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        if (!policy) {
            const policyId = await ctx.db.insert("riskPolicies", {
                name: "Default Policy",
                description: "Standard risk assessment settings",
                thresholds: {
                    low: "0.2",
                    medium: "0.5",
                    high: "0.8",
                    critical: "0.9"
                },
                mlEnabled: true,
                userId: identity.subject,
            });
            policy = await ctx.db.get(policyId);
        }

        const appId = `app_demo_${Math.random().toString(36).substring(2, 6)}`;
        const apiKey = `ak_demo_${Math.random().toString(36).substring(2, 8)}`;
        const secret = `sk_demo_${Math.random().toString(36).substring(2, 8)}`;

        const id = await ctx.db.insert("applications", {
            name: "Demo Application",
            environment: "Development",
            riskPolicyId: policy!._id,
            status: "Active",
            type: "Web app",
            mlEnhancement: true,
            appId,
            apiKey,
            secret,
            userId: identity.subject,
        });

        return await ctx.db.get(id);
    },
});
