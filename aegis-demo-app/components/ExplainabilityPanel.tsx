"use client";

import { useRiskContext } from "@/lib/riskContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function ExplainabilityPanel() {
  const { risk } = useRiskContext();

  // Mocking detailed breakdown based on current risk score
  const score = risk ? risk.risk_score : 0.2;

  const factors = [
    { label: "Login Anomaly", value: score > 0.6 ? 85 : 12, desc: "Evaluates time-of-day and geo-velocity signals" },
    { label: "Session Behavior", value: score > 0.8 ? 92 : 8, desc: "Analyzes continuous interaction patterns" },
    { label: "Device Trust", value: score > 0.4 ? 45 : 15, desc: "Hardware fingerprint and trusted context" },
    { label: "Baseline Drift", value: 10, desc: "Deviation from user's historical norms" },
    { label: "Global Threat", value: 5, desc: "Correlation with platform-wide attack signals" },
  ];

  const highest = [...factors].sort((a, b) => b.value - a.value)[0];

  return (
    <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center justify-between">
          Risk Explainability (XAI)
          {highest.value > 50 && (
            <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full lowercase font-bold border border-emerald-400/20">
              Primary Driver: {highest.label}
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-slate-400 font-medium">Neural contribution weights per security layer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TooltipProvider>
          {factors.map((f) => (
            <div key={f.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{f.label}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3 text-slate-500 cursor-help hover:text-white transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-slate-800 border-white/10 text-white">
                      <p className="text-xs">{f.desc}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">{f.value}%</span>
              </div>
              <Progress value={f.value} className="h-1.5 bg-white/5 [&>div]:bg-emerald-500" />
            </div>
          ))}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
