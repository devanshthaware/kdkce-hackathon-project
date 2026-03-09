import { mutation } from "./_generated/server";
import { v } from "convex/values";

const DEMO_SESSIONS = [
    { browser: "Chrome 120.0", device: "MacBook Pro", location: "San Francisco, CA", ip: "192.168.1.105", status: "safe", riskScore: 12 },
    { browser: "Safari 17.2", device: "iPhone 15 Pro", location: "London, UK", ip: "82.34.21.19", status: "safe", riskScore: 5 },
    { browser: "Firefox 121.0", device: "Windows 11 PC", location: "Berlin, DE", ip: "109.43.2.1", status: "suspicious", riskScore: 68 },
    { browser: "Chrome 119.0", device: "Unknown Device", location: "Moscow, RU", ip: "45.12.33.91", status: "blocked", riskScore: 94 },
    { browser: "Edge 120.0", device: "MacBook Air", location: "Austin, TX", ip: "172.16.4.22", status: "safe", riskScore: 18 },
    { browser: "Chrome Nightly", device: "Linux Desktop", location: "Beijing, CN", ip: "203.11.44.2", status: "blocked", riskScore: 88 },
    { browser: "Safari 16.5", device: "iPad Air", location: "Tokyo, JP", ip: "133.45.2.11", status: "safe", riskScore: 8 },
    { browser: "Chrome 120.0", device: "Windows 10 Laptop", location: "Toronto, CA", ip: "198.51.100.4", status: "suspicious", riskScore: 45 },
    { browser: "Opera 105.0", device: "Android Tablet", location: "Sydney, AU", ip: "1.1.1.1", status: "safe", riskScore: 10 },
    { browser: "Brave 1.61", device: "Mac Studio", location: "New York, NY", ip: "10.0.0.45", status: "safe", riskScore: 3 },
    { browser: "Chrome 118.0", device: "Unknown Mobile", location: "Lagos, NG", ip: "102.132.4.5", status: "suspicious", riskScore: 72 },
    { browser: "Safari 17.0", device: "MacBook Pro M3", location: "San Jose, CA", ip: "192.168.1.201", status: "safe", riskScore: 15 },
    { browser: "Firefox 115.0", device: "Ubuntu Linux", location: "Paris, FR", ip: "213.4.5.6", status: "safe", riskScore: 22 },
    { browser: "Edge 119.0", device: "Surface Pro", location: "Chicago, IL", ip: "172.16.8.99", status: "safe", riskScore: 7 },
    { browser: "Tor Browser", device: "Unknown Device", location: "Unknown", ip: "185.220.101.5", status: "blocked", riskScore: 98 },
];

export const seedUserData = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const userId = identity.subject;

        // 1. Ensure user has a default organization (CRITICAL: Do this before early return)
        let orgMembership = await ctx.db
            .query("organizationMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .first();

        let organizationId;
        let createdNewOrg = false;
        
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
            createdNewOrg = true;
        } else {
            organizationId = orgMembership.organizationId;
        }

        // Check if user already has an application
        const existingApps = await ctx.db
            .query("applications")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        let migratedApps = false;
        if (existingApps.length > 0) {
            // Migrate legacy apps to the default organization if they lack one
            for (const app of existingApps) {
                if (!app.organizationId) {
                    await ctx.db.patch(app._id, {
                        organizationId: organizationId,
                    });
                    migratedApps = true;
                }
            }

            // Data already seeded or app created manually
            return { 
                success: true, 
                seeded: false, 
                orgCreated: createdNewOrg,
                migratedApps
            };
        }

        // 2. Create Default Risk Policy
        const policyId = await ctx.db.insert("riskPolicies", {
            name: "Initial Security Policy",
            description: "Default baseline security policy for demo data",
            thresholds: {
                low: "0.3",
                medium: "0.6",
                high: "0.85",
                critical: "0.95"
            },
            mlEnabled: true,
            userId: userId,
        });

        // 2. Create Demo Application
        const appIdStr = `app_demo_${Math.random().toString(36).substring(2, 6)}`;
        const apiKey = `ak_demo_${Math.random().toString(36).substring(2, 8)}`;
        const secret = `sk_demo_${Math.random().toString(36).substring(2, 8)}`;

        const email = identity.email ?? `user_${userId.substring(0, 5)}@demo.com`;

        const appId = await ctx.db.insert("applications", {
            name: "Aegis Demo Interface",
            environment: "Development",
            riskPolicyId: policyId,
            status: "Active",
            type: "Web app",
            mlEnhancement: true,
            appId: appIdStr,
            apiKey,
            secret,
            userId: userId,
            organizationId,
        });

        // 4. Generate Sessions spread across the last 7 days
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        for (let i = 0; i < DEMO_SESSIONS.length; i++) {
            const template = DEMO_SESSIONS[i];
            
            // Randomly offset time within the last 7 days
            // Skew to have more recent events
            const randomDaysAgo = Math.pow(Math.random(), 2) * 7; 
            const sessionTime = now - (randomDaysAgo * oneDayMs);

            const status = template.status as "safe" | "suspicious" | "blocked";

            const sessionId = await ctx.db.insert("sessions", {
                applicationId: appId,
                userEmail: email,
                device: template.device,
                browser: template.browser,
                location: template.location,
                ip: template.ip,
                status: status,
                riskScore: template.riskScore,
                loginTime: sessionTime,
            });

            // Corresponding Activity Log
            let action = "Login Attempt";
            if (template.riskScore > 60) action = "Anomalous Login Detected";
            if (template.riskScore > 85) action = "Login Blocked";

            await ctx.db.insert("activities", {
                applicationId: appId,
                userEmail: email,
                action: action,
                device: template.device,
                location: template.location,
                risk: status,
                timestamp: sessionTime,
            });
        }

        return { success: true, seeded: true };
    },
});
