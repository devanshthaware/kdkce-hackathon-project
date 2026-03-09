import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
    args: { applicationId: v.optional(v.id("applications")) },
    handler: async (ctx, args) => {
        if (args.applicationId) {
            return await ctx.db
                .query("activities")
                .withIndex("by_application", (q) => q.eq("applicationId", args.applicationId!))
                .order("desc")
                .take(50);
        }
        return await ctx.db.query("activities").order("desc").take(50);
    },
});
