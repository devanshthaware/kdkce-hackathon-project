import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_email") || searchParams.get("user_id");

        if (!userId) {
            return NextResponse.json(
                { error: "Missing user_email parameter. Please provide a valid admin user_email." },
                { status: 400 }
            );
        }

        const alerts = await fetchQuery(api.agent.getCriticalAlerts, { userId });

        // Text summary optimized for text-to-speech
        let summaryText = "There are no critical alerts or high risk sessions at the moment. All systems look secure.";

        if (alerts.length > 0) {
            summaryText = `I found ${alerts.length} recent critical alerts. `;
            alerts.forEach((alert) => {
                const time = new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                summaryText += `At ${time}, a ${alert.risk} risk event was flagged for a user using ${alert.device} from ${alert.location}. The action taken was ${alert.action}. `;
            });
        }

        return NextResponse.json({
            success: true,
            alerts,
            summary: summaryText
        });
    } catch (error) {
        console.error("Agent alerts error:", error);
        return NextResponse.json(
            { error: "Internal Server Error while fetching critical alerts." },
            { status: 500 }
        );
    }
}
