"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRiskContext } from "@/lib/riskContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShieldAlert, Lock, UserCog } from "lucide-react";

export default function AdminPage() {
    const { risk } = useRiskContext();
    const level = risk?.risk_level ?? "LOW";

    if (level === "CRITICAL") {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-red-500/50 bg-red-500/5 backdrop-blur-xl p-8 text-center space-y-6">
                    <div className="size-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto border-2 border-red-500 animate-pulse">
                        <Lock className="size-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Terminal Locked</h1>
                        <p className="text-slate-400 text-sm">
                            Access to administrative functions has been suspended due to a critical security escalation.
                            Your session integrity cannot be verified.
                        </p>
                    </div>
                    <div className="pt-4">
                        <Badge variant="destructive" className="px-4 py-1 animate-bounce">
                            CRITICAL RISK DETECTED
                        </Badge>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] p-12 text-white">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="size-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <UserCog className="size-6 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Admin Terminal</h1>
                        <p className="text-slate-400">Enterprise administrative controls and policy management</p>
                    </div>
                </div>

                {level === "HIGH" && (
                    <Alert className="animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.1)] border-red-500/50 bg-red-500/5 text-red-400">
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                        <AlertTitle className="font-bold uppercase tracking-tight">Privilege Escalation Blocked</AlertTitle>
                        <AlertDescription className="text-red-400/80">
                            Sensitive operations are disabled due to elevated risk scoring. Access Level: READ-ONLY.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className={cn(
                        "bg-slate-900 border-white/5 transition-all",
                        level === "HIGH" && "opacity-50 pointer-events-none grayscale"
                    )}>
                        <CardHeader>
                            <CardTitle className="text-sm">Policy Manager</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 bg-white/5 animate-pulse rounded-md" />
                        </CardContent>
                    </Card>
                    <Card className={cn(
                        "bg-slate-900 border-white/5 transition-all",
                        level === "HIGH" && "opacity-50 pointer-events-none grayscale"
                    )}>
                        <CardHeader>
                            <CardTitle className="text-sm">Audit Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 bg-white/5 animate-pulse rounded-md" />
                        </CardContent>
                    </Card>
                    <Card className={cn(
                        "bg-slate-900 border-white/5 transition-all",
                        level === "HIGH" && "opacity-20 pointer-events-none grayscale border-red-500/20"
                    )}>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Lock className="size-3" />
                                Credential Vault
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-24 bg-white/5 animate-pulse rounded-md" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
