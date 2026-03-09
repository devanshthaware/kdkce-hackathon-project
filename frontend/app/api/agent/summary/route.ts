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

        const stats = await fetchQuery(api.agent.getDashboardSummary, { userId });

        // Provide a neat text summary optimized for text-to-speech output in ElevenLabs
        const summaryText = `The dashboard currently shows ${stats.totalSessions} total sessions across ${stats.activeApps} active applications. There are ${stats.highRiskAlerts} high risk alerts. The average risk score is ${stats.avgRiskScore}.`;

        return NextResponse.json({
            success: true,
            stats,
            summary: summaryText
        });
    } catch (error) {
        console.error("Agent summary error:", error);
        return NextResponse.json(
            { error: "Internal Server Error while generating dashboard summary." },
            { status: 500 }
        );
    }
}
