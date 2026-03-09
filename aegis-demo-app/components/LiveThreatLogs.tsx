"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRiskContext } from "@/lib/riskContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function LiveThreatLogs() {
    const { logs } = useRiskContext();

    return (
        <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader>
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Live Threat Logs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[300px] w-full border-t border-white/5 p-4 bg-black/20">
                    <div className="space-y-3">
                        {logs.length === 0 ? (
                            <div className="h-full flex items-center justify-center py-20 text-slate-600 italic text-sm">
                                Listening for telemetry signals...
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div key={log.id} className="text-[11px] font-mono flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 group">
                                    <span className="text-slate-600 whitespace-nowrap opacity-50 font-bold">[{log.time}]</span>
                                    <span className={cn(
                                        "font-black uppercase tracking-tighter px-1 rounded bg-white/5",
                                        log.level === 'SECURITY' || log.level === 'ERROR' ? 'text-red-500 bg-red-500/10' :
                                            log.level === 'WARN' ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10'
                                    )}>
                                        {log.level}
                                    </span>
                                    <span className="text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
