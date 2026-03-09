"use client";

import RiskPanel from "@/components/RiskPanel";
import ExplainabilityPanel from "@/components/ExplainabilityPanel";
import AttackSimulator from "@/components/AttackSimulator";
import LiveThreatLogs from "@/components/LiveThreatLogs";
import PlatformStatusBar from "@/components/PlatformStatusBar";
import DeviceInfoCard from "@/components/DeviceInfoCard";
import RiskTimeline from "@/components/RiskTimeline";
import SessionMonitor from "@/components/SessionMonitor";
import AlertModal from "@/components/AlertModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { useRiskContext } from "@/lib/riskContext";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
    const { risk } = useRiskContext();
    const level = risk?.risk_level ?? "LOW";
    const isHighOrCritical = level === "HIGH" || level === "CRITICAL";

    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 selection:bg-emerald-500/30">
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
                {/* Header Status Bar */}
                <PlatformStatusBar />

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bottom Left: Live Logs */}
                    <LiveThreatLogs />

                    {/* Bottom Right: Explainability & Simulator */}
                    <div className="space-y-6">
                        <ExplainabilityPanel />
                        <AttackSimulator />
                    </div>
                </div>
            </div>

            <AlertModal />
        </div>
    );
}
