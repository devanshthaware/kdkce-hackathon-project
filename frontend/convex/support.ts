import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTickets = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("supportTickets")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

export const createTicket = mutation({
    args: { userId: v.string(), issueType: v.string() },
    handler: async (ctx, args) => {
        const ticketId = await ctx.db.insert("supportTickets", {
            userId: args.userId,
            status: "open",
            issueType: args.issueType,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        // Add initial system message
        await ctx.db.insert("supportMessages", {
            ticketId,
            senderId: "system",
            senderRole: "ai",
            content: "Hello! I'm the AegisAuth Support Assistant. How can I help you today?",
            timestamp: Date.now(),
            isAiGenerated: true,
            status: "delivered",
        });

        return ticketId;
    },
});

export const getMessages = query({
    args: { ticketId: v.id("supportTickets") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("supportMessages")
            .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
            .order("asc")
            .collect();
    },
});

export const sendMessage = mutation({
    args: {
        ticketId: v.id("supportTickets"),
        senderId: v.string(),
        senderRole: v.string(), // "user", "agent", "ai"
        content: v.string(),
        isAiGenerated: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("supportMessages", {
            ticketId: args.ticketId,
            senderId: args.senderId,
            senderRole: args.senderRole,
            content: args.content,
            timestamp: Date.now(),
            isAiGenerated: args.isAiGenerated ?? false,
            status: "sent",
        });

        await ctx.db.patch(args.ticketId, {
            updatedAt: Date.now(),
        });

        return messageId;
    },
});
