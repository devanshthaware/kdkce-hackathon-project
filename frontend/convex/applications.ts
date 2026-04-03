import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Access Control Helper: Ensures user owns the application.
 */
async function validateOwnership(ctx: any, applicationId: any) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const app = await ctx.db.get(applicationId);
    if (!app || app.userId !== identity.subject) {
        throw new Error("Forbidden: Access denied");
    }
    return { identity, app };
}

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

export const getApplicationsByOrg = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // ENFORCEMENT: Verify org membership
    const membership = await ctx.db
        .query("organizationMembers")
        .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
        .filter((q: any) => q.eq(q.field("organizationId"), args.organizationId))
        .first();
    if (!membership) throw new Error("Forbidden: Not a member of this organization");

    return await ctx.db
      .query("applications")
      .withIndex("by_org", q =>
        q.eq("organizationId", args.organizationId)
      )
      .collect();
  }
});

export const create = mutation({
    args: {
        name: v.string(),
        environment: v.string(),
        riskPolicyId: v.id("riskPolicies"),
        type: v.string(),
        redirectUri: v.optional(v.string()),
        mlEnhancement: v.boolean(),
        organizationId: v.id("organizations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Identity derived at signal entry
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
        await validateOwnership(ctx, args.id);
        const { id, ...data } = args;
        await ctx.db.patch(id, data);
    },
});

export const toggleStatus = mutation({
    args: { id: v.id("applications") },
    handler: async (ctx, args) => {
        await validateOwnership(ctx, args.id);
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

        let policy = await ctx.db
            .query("riskPolicies")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        if (!policy) {
            const policyId = await ctx.db.insert("riskPolicies", {
                name: "Default Policy",
                description: "Standard risk assessment settings",
                thresholds: { low: "0.2", medium: "0.5", high: "0.8", critical: "0.9" },
                mlEnabled: true,
                userId: identity.subject,
            });
            policy = await ctx.db.get(policyId);
        }

        let orgMembership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        let organizationId;
        if (!orgMembership) {
            organizationId = await ctx.db.insert("organizations", {
                name: "Personal Workspace",
                ownerId: identity.subject,
                createdAt: Date.now(),
            });
            await ctx.db.insert("organizationMembers", {
                organizationId,
                userId: identity.subject,
                role: "owner",
            });
        } else {
            organizationId = orgMembership.organizationId;
        }

        const id = await ctx.db.insert("applications", {
            name: "Demo Application",
            environment: "Development",
            riskPolicyId: policy!._id,
            status: "Active",
            type: "Web app",
            mlEnhancement: true,
            appId: `app_demo_${Math.random().toString(36).substring(2, 6)}`,
            apiKey: `ak_demo_${Math.random().toString(36).substring(2, 8)}`,
            secret: `sk_demo_${Math.random().toString(36).substring(2, 8)}`,
            userId: identity.subject,
            organizationId,
        });

        return await ctx.db.get(id);
    },
});
