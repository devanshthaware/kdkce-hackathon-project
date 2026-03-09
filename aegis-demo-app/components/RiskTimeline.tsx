"use client";

import { useRiskContext } from "@/lib/riskContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function RiskTimeline() {
    const { riskHistory } = useRiskContext();

    return (
        <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader>
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Session Risk Timeline</CardTitle>
            </CardHeader>
            <CardContent className="h-40 flex items-end gap-1 px-6 pb-6 pt-2">
                {riskHistory.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center border-t border-border">
                        <p className="text-xs text-muted-foreground">Waiting for telemetry markers...</p>
                    </div>
                ) : (
                    riskHistory.map((point, i) => {
                        const height = `${(point.score * 100)}%`;
                        return (
                            <div
                                key={point.t}
                                className="flex-1 group relative flex flex-col justify-end h-full"
                            >
                                <div
                                    className={cn(
                                        "w-full rounded-t-sm transition-all duration-500",
                                        point.level === "CRITICAL" ? "bg-red-500" :
                                            point.level === "HIGH" ? "bg-orange-500" :
                                                point.level === "MEDIUM" ? "bg-yellow-500" : "bg-primary/50"
                                    )}
                                    style={{ height }}
                                />
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border px-1.5 py-0.5 rounded text-[8px] font-mono z-20 whitespace-nowrap">
                                    {Math.round(point.score * 100)}%
                                </div>
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
