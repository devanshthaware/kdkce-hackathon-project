import { mutation } from "./_generated/server";
import { v } from "convex/values";

const DEMO_SESSIONS = [
    { browser: "Chrome 120.0", device: "MacBook Pro", location: "San Francisco, CA", ip: "192.168.1.105", state: "ACTIVE", score: 0.12 },
    { browser: "Safari 17.2", device: "iPhone 15 Pro", location: "London, UK", ip: "82.34.21.19", state: "ACTIVE", score: 0.05 },
    { browser: "Firefox 121.0", device: "Windows 11 PC", location: "Berlin, DE", ip: "109.43.2.1", state: "CHALLENGED", score: 0.68 },
    { browser: "Chrome 119.0", device: "Unknown Device", location: "Moscow, RU", ip: "45.12.33.91", state: "BLOCKED", score: 0.94 },
    { browser: "Edge 120.0", device: "MacBook Air", location: "Austin, TX", ip: "172.16.4.22", state: "ACTIVE", score: 0.18 },
    { browser: "Chrome Nightly", device: "Linux Desktop", location: "Beijing, CN", ip: "203.11.44.2", state: "BLOCKED", score: 0.88 },
    { browser: "Safari 16.5", device: "iPad Air", location: "Tokyo, JP", ip: "133.45.2.11", state: "ACTIVE", score: 0.08 },
    { browser: "Chrome 120.0", device: "Windows 10 Laptop", location: "Toronto, CA", ip: "198.51.100.4", state: "CHALLENGED", score: 0.45 },
    { browser: "Opera 105.0", device: "Android Tablet", location: "Sydney, AU", ip: "1.1.1.1", state: "ACTIVE", score: 0.10 },
    { browser: "Brave 1.61", device: "Mac Studio", location: "New York, NY", ip: "10.0.0.45", state: "ACTIVE", score: 0.03 },
    { browser: "Chrome 118.0", device: "Unknown Mobile", location: "Lagos, NG", ip: "102.132.4.5", state: "CHALLENGED", score: 0.72 },
    { browser: "Safari 17.0", device: "MacBook Pro M3", location: "San Jose, CA", ip: "192.168.1.201", state: "ACTIVE", score: 0.15 },
    { browser: "Firefox 115.0", device: "Ubuntu Linux", location: "Paris, FR", ip: "213.4.5.6", state: "ACTIVE", score: 0.22 },
    { browser: "Edge 119.0", device: "Surface Pro", location: "Chicago, IL", ip: "172.16.8.99", state: "ACTIVE", score: 0.07 },
    { browser: "Tor Browser", device: "Unknown Device", location: "Unknown", ip: "185.220.101.5", state: "BLOCKED", score: 0.98 },
];

export const seedUserData = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const userId = identity.subject;

        let orgMembership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        let organizationId;
        if (!orgMembership) {
            organizationId = await ctx.db.insert("organizations", {
                name: "Personal Workspace",
                ownerId: userId,
                createdAt: Date.now(),
            });
            await ctx.db.insert("organizationMembers", {
                organizationId,
                userId: userId,
                role: "owner",
            });
        } else {
            organizationId = orgMembership.organizationId;
        }

        const existingApps = await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        if (existingApps.length > 0) return { success: true, seeded: false };

        const policyId = await ctx.db.insert("riskPolicies", {
            name: "Initial Security Policy",
            description: "Default baseline security policy for demo data",
            thresholds: { low: "0.3", medium: "0.6", high: "0.85", critical: "0.95" },
            mlEnabled: true,
            userId: userId,
        });

        const appId = await ctx.db.insert("applications", {
            name: "Aegis Demo Interface",
            environment: "Development",
            riskPolicyId: policyId,
            status: "Active",
            type: "Web app",
            mlEnhancement: true,
            appId: `app_demo_${Math.random().toString(36).substring(2, 6)}`,
            apiKey: `ak_demo_${Math.random().toString(36).substring(2, 8)}`,
            secret: `sk_demo_${Math.random().toString(36).substring(2, 8)}`,
            userId: userId,
            organizationId,
        });

        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const email = identity.email ?? "demo@user.com";

        for (let i = 0; i < DEMO_SESSIONS.length; i++) {
            const template = DEMO_SESSIONS[i];
            const randomDaysAgo = Math.pow(Math.random(), 2) * 7; 
            const sessionTime = now - (randomDaysAgo * oneDayMs);
            const correlationId = `corr_seed_${i}_${Math.random().toString(36).substring(2, 5)}`;

            const sessionId = await ctx.db.insert("sessions", {
                applicationId: appId,
                userEmail: email,
                device: template.device,
                browser: template.browser,
                location: template.location,
                ip: template.ip,
                state: template.state,
                score: template.score,
                loginTime: sessionTime,
                stateVersion: 1,
                updatedAt: sessionTime,
                correlationId,
            });

            // Seed Events
            await ctx.db.insert("events", {
                type: "SIGNAL_RECEIVED",
                sessionId,
                correlationId,
                applicationId: appId,
                timestamp: sessionTime - 1000,
                payload: { browser: template.browser, device: template.device }
            });

            await ctx.db.insert("events", {
                type: "STATE_TRANSITIONED",
                sessionId,
                correlationId,
                applicationId: appId,
                timestamp: sessionTime,
                payload: { from: "NEW", to: template.state, reason: "Seed Data Generation" }
            });
        }

        return { success: true, seeded: true };
    },
});
