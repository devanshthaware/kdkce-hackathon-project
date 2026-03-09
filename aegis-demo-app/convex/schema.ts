import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    applications: defineTable({
        name: v.string(),
        environment: v.string(), // Development, Production, Staging
        riskPolicyId: v.id("riskPolicies"),
        status: v.string(), // Active, Inactive
        type: v.string(),
        redirectUri: v.optional(v.string()),
        mlEnhancement: v.boolean(),
        appId: v.string(),
        apiKey: v.string(),
        secret: v.string(),
        userId: v.string(), // Clerk User ID
    }).index("by_user", ["userId"]),

    sessions: defineTable({
        applicationId: v.id("applications"),
        userEmail: v.string(),
        device: v.string(),
        browser: v.string(),
        location: v.string(),
        ip: v.string(),
        riskScore: v.number(),
        status: v.string(), // safe, suspicious, blocked
        loginTime: v.number(), // Timestamp
    }).index("by_application", ["applicationId"]),

    riskPolicies: defineTable({
        name: v.string(),
        description: v.string(),
        thresholds: v.object({
            low: v.string(),
            medium: v.string(),
            high: v.string(),
            critical: v.string()
        }),
        mlEnabled: v.boolean(),
        userId: v.string(),
    }).index("by_user", ["userId"]),

    activities: defineTable({
        applicationId: v.id("applications"),
        userEmail: v.string(),
        action: v.string(),
        device: v.string(),
        location: v.string(),
        risk: v.string(),
        timestamp: v.number(),
    }).index("by_application", ["applicationId"]),

    messages: defineTable({
        author: v.string(),
        body: v.string(),
    }).index("by_author", ["author"]),
});
