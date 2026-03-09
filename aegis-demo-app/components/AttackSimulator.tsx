"use client";

import { useCallback, useState } from "react";
import { useRiskContext } from "@/lib/riskContext";
import { aegisClient } from "@/lib/sdk";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

type SimFlag =
  | "apiBurst"
  | "privilegeEscalation"
  | "sensitiveRoute"
  | "tokenReplay"
  | "dataDownloadSpike";

const TOGGLES: { key: SimFlag; label: string; desc: string }[] = [
  { key: "apiBurst", label: "API Burst", desc: "Simulate high-frequency rate limit violation" },
  { key: "privilegeEscalation", label: "Privilege Escalation", desc: "Attempt unauthorized SUDO behavior" },
  { key: "sensitiveRoute", label: "Sensitive Route", desc: "Access restricted /admin/vault segments" },
  { key: "tokenReplay", label: "Token Replay", desc: "Reuse intercepted session artifacts" },
  { key: "dataDownloadSpike", label: "Data Leak Spike", desc: "Rapid mass data extraction attempt" },
];

export default function AttackSimulator() {
  const { user } = useUser();
  const { setRisk, addRiskToTimeline, addLog, isLocked, sessionId } = useRiskContext();
  const [flags, setFlags] = useState<Record<SimFlag, boolean>>({
    apiBurst: false,
    privilegeEscalation: false,
    sensitiveRoute: false,
    tokenReplay: false,
    dataDownloadSpike: false,
  });
  const [loading, setLoading] = useState(false);
  const updateSessionRisk = useMutation(api.sessions.updateSessionRisk);

  const toggle = useCallback(
    async (key: SimFlag) => {
      if (isLocked) return;
      const next = { ...flags, [key]: !flags[key] };
      setFlags(next);
      setLoading(true);

      const actionLabel = key.split(/(?=[A-Z])/).join(" ");
      addLog("INFO", `Simulating attack vector: ${actionLabel}...`);

      try {
        const risk = await aegisClient.checkRisk({
          userId: user?.id || "demo_user",
          email: user?.primaryEmailAddress?.emailAddress || "demo@aegis.local",
          simulateFlags: {
            apiBurst: next.apiBurst || undefined,
            privilegeEscalation: next.privilegeEscalation || undefined,
          },
          metadata: {
            sensitive_route_access: next.sensitiveRoute,
            token_replay_attempt: next.tokenReplay,
            bulk_download: next.dataDownloadSpike
          }
        });

        setRisk(risk);
        addRiskToTimeline(risk);
        addLog(
          "SECURITY",
          `Vector neutralized → ${risk.risk_level} (${(risk.risk_score * 100).toFixed(0)}%)`
        );

        if (sessionId) {
          await updateSessionRisk({
            sessionId: sessionId as any,
            riskScore: risk.risk_score,
            status: risk.risk_level.toLowerCase()
          });
        }
      } catch (e) {
        addLog("ERROR", `Simulation engine fault: ${e instanceof Error ? e.message : "Network Err"}`);
      } finally {
        setLoading(false);
      }
    },
    [flags, isLocked, setRisk, addRiskToTimeline, addLog, user, sessionId, updateSessionRisk]
  );

  return (
    <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Attack Simulation Hub</CardTitle>
        <CardDescription className="text-slate-400 font-medium font-medium">Trigger malicious behavior to observe real-time escalation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {TOGGLES.map(({ key, label, desc }, idx) => (
          <div key={key}>
            <div className={cn("flex items-center justify-between space-x-2 py-2 transition-opacity", isLocked && "opacity-20 pointer-events-none grayscale")}>
              <div className="space-y-0.5">
                <Label htmlFor={key} className="text-sm font-black text-slate-200 cursor-pointer uppercase tracking-tight">
                  {label}
                </Label>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{desc}</p>
              </div>
              <Switch
                id={key}
                checked={flags[key]}
                onCheckedChange={() => toggle(key)}
                disabled={isLocked || loading}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
            {idx < TOGGLES.length - 1 && <Separator className="bg-white/5" />}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 pt-2">
            <div className="size-2 bg-primary rounded-full animate-ping" />
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Analyzing Threat Pattern...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
