"use client";

import RiskPanel from "@/components/RiskPanel";
import ExplainabilityPanel from "@/components/ExplainabilityPanel";
import AttackSimulator from "@/components/AttackSimulator";
import LiveThreatLogs from "@/components/LiveThreatLogs";
import PlatformStatusBar from "@/components/PlatformStatusBar";
import DeviceInfoCard from "@/components/DeviceInfoCard";
import RiskTimeline from "@/components/RiskTimeline";
import AlertModal from "@/components/AlertModal";
import TelemetryInspector from "@/components/TelemetryInspector";
import ConsequenceOverlay from "@/components/ConsequenceOverlay";
import PolicyStatusBadge from "@/components/PolicyStatusBadge";

import { useRiskContext } from "@/lib/riskContext";
import { AlertCircle, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    const { risk } = useRiskContext();
    const level = risk?.risk_level ?? "LOW";
    const isHighOrCritical = level === "HIGH" || level === "CRITICAL";

    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 selection:bg-emerald-500/30">
            {/* Full-screen adaptive consequence overlays */}
            <ConsequenceOverlay />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Escalation Banner */}
                {isHighOrCritical && (
                    <div className="sticky top-0 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="size-5 text-amber-500" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-amber-400">Security Escalation Level: {level}</h4>
                                    <p className="text-xs text-amber-500/80">Continuous monitoring has been escalated. Session integrity is being re-verified.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Status Bar + Policy Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <PlatformStatusBar />
                    <PolicyStatusBadge />
                </div>

                {/* Top Row: Risk Panel (Full Width) */}
                <div className="w-full">
                    <RiskPanel />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Middle Left: Device Info */}
                    <DeviceInfoCard />
                    {/* Middle Right: Risk Timeline */}
                    <RiskTimeline />
                </div>

                {/* Telemetry Inspector Row */}
                <div className="w-full">
                    <TelemetryInspector />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bottom Left: Live Logs */}
                    <LiveThreatLogs />

                    {/* Bottom Right: Explainability & Simulator */}
                    <div className="space-y-6">
                        <ExplainabilityPanel />
                        <AttackSimulator />
                    </div>
                </div>

                {/* Protected Vault Sandbox CTA */}
                <div className="rounded-xl border border-white/5 bg-slate-900/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                            <Lock className="size-4 text-emerald-400" />
                            Protected Route Sandbox
                        </p>
                        <p className="text-xs text-slate-400">
                            Try accessing the Secure Vault. AegisAuth will intercept the route and evaluate your current risk score. Trigger a HIGH attack first to see it get blocked.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 shrink-0">
                        <Link href="/dashboard/vault">Access Secure Vault →</Link>
                    </Button>
                </div>
            </div>

            <AlertModal />
        </div>
    );
}

