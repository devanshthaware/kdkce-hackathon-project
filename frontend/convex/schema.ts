import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    activities: defineTable({
        action: v.string(),
        applicationId: v.id("applications"),
        device: v.string(),
        location: v.string(),
        risk: v.string(),
        timestamp: v.float64(),
        userEmail: v.string(),
    }).index("by_application", ["applicationId"]),
    applications: defineTable({
        apiKey: v.string(),
        appId: v.string(),
        environment: v.string(),
        mlEnhancement: v.boolean(),
        name: v.string(),
        organizationId: v.optional(v.string()), // Added organizationId to fix schema validation
        redirectUri: v.optional(v.string()),
        riskPolicyId: v.id("riskPolicies"),
        secret: v.string(),
        status: v.string(),
        type: v.string(),
        userId: v.string(),
    }).index("by_user", ["userId"]),
    messages: defineTable({
        author: v.string(),
        body: v.string(),
    }).index("by_author", ["author"]),
    riskPolicies: defineTable({
        description: v.string(),
        mlEnabled: v.boolean(),
        name: v.string(),
        thresholds: v.object({
            critical: v.string(),
            high: v.string(),
            low: v.string(),
            medium: v.string(),
        }),
        userId: v.string(),
    }).index("by_user", ["userId"]),
    sessions: defineTable({
        applicationId: v.id("applications"),
        browser: v.string(),
        device: v.string(),
        ip: v.string(),
        location: v.string(),
        loginTime: v.float64(),
        riskScore: v.float64(),
        status: v.string(),
        userEmail: v.string(),
    }).index("by_application", ["applicationId"]),
    supportMessages: defineTable({
        content: v.string(),
        isAiGenerated: v.boolean(),
        senderId: v.string(),
        senderRole: v.string(),
        status: v.string(),
        ticketId: v.id("supportTickets"),
        timestamp: v.float64(),
    }).index("by_ticket", ["ticketId"]),
    supportTickets: defineTable({
        createdAt: v.float64(),
        issueType: v.string(),
        status: v.string(),
        updatedAt: v.float64(),
        userId: v.string(),
    }).index("by_user", ["userId"]).index("by_status", ["status"]),
    systemSettings: defineTable({
        key: v.string(),
        value: v.any(),
    }).index("by_key", ["key"]),
});
