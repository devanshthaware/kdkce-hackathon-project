"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Lock, AlertTriangle } from "lucide-react";
import { aegisClient } from "@/lib/sdk";
import { useRiskContext } from "@/lib/riskContext";
import { cn } from "@/lib/utils";

// ─── Hardcoded Demo Credentials ──────────────────────────────────────
const ALLOWED_EMAIL    = "bin.devansh@gmail.com";
const ALLOWED_PASSWORD = "123";

export default function LoginPage() {
    const router = useRouter();
    const { setRisk, addLog } = useRiskContext();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [shake, setShake] = useState(false);
    const [flags, setFlags] = useState({
        newDevice: false,
        countryChange: false,
        vpnMode: false,
    });

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 600);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");

        // Step 1: Validate hardcoded credentials
        if (email.trim().toLowerCase() !== ALLOWED_EMAIL || password !== ALLOWED_PASSWORD) {
            setAuthError("Invalid credentials. Access restricted to authorized personnel only.");
            triggerShake();
            addLog("ERROR", `🚫 Failed login attempt for "${email}". Unauthorized.`);
            return;
        }

        setLoading(true);
        addLog("INFO", `Credential check passed for ${email}. Running AegisAuth protection...`);

        try {
            const risk = await aegisClient.protectLogin({
                userId: "demo_user_devansh",
                email: ALLOWED_EMAIL,
                simulateFlags: {
                    newDevice: flags.newDevice,
                    countryChange: flags.countryChange,
                    vpn: flags.vpnMode,
                },
                metadata: {
                    ip: flags.countryChange ? "45.12.33.1" : "127.0.0.1",
                }
            });

            setRisk(risk);
            addLog("SECURITY", `Login evaluation: ${risk.risk_level} (${(risk.risk_score * 100).toFixed(0)}%)`);

            if (risk.risk_level === "CRITICAL" || risk.risk_level === "HIGH") {
                addLog("WARN", "High-risk signals detected. Access restricted.");
            } else {
                sessionStorage.setItem("aegis_demo_auth", btoa(ALLOWED_EMAIL));
                router.push("/dashboard");
            }
        } catch {
            addLog("WARN", "ML backend offline – proceeding with local auth.");
            sessionStorage.setItem("aegis_demo_auth", btoa(ALLOWED_EMAIL));
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <Card className={cn(
                "w-full max-w-md border-white/10 shadow-2xl bg-slate-900/70 backdrop-blur-xl relative z-10 transition-transform",
                shake && "animate-[shake_0.5s_ease-in-out]"
            )}>
                <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

                <CardHeader className="flex flex-col items-center pb-4">
                    <div className="size-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-3 border border-emerald-500/20">
                        <Shield className="size-7 text-emerald-400" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight text-white">AegisAuth Demo</CardTitle>
                    <CardDescription className="text-slate-400 text-center text-xs">
                        Secure terminal access · Authorized personnel only
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setAuthError(""); }}
                                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/50 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
                                className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/50 h-11"
                            />
                        </div>

                        {authError && (
                            <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertTriangle className="size-4 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-300 leading-relaxed">{authError}</p>
                            </div>
                        )}

                        <div className="pt-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                AegisAuth Simulation Vectors
                            </Label>
                            {[
                                { id: "nd", label: "New Device", desc: "Unrecognized hardware simulation", key: "newDevice" as const },
                                { id: "cc", label: "Country Change", desc: "Geo-velocity anomaly simulation", key: "countryChange" as const },
                                { id: "vp", label: "VPN Mode", desc: "Masked egress point simulation", key: "vpnMode" as const },
                            ].map(({ id, label, desc, key }) => (
                                <div key={id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-slate-800/30">
                                    <div>
                                        <Label htmlFor={id} className="text-slate-300 text-sm">{label}</Label>
                                        <p className="text-[10px] text-slate-600">{desc}</p>
                                    </div>
                                    <Switch
                                        id={id}
                                        checked={flags[key]}
                                        onCheckedChange={(c) => setFlags(f => ({ ...f, [key]: c }))}
                                    />
                                </div>
                            ))}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 font-bold text-sm mt-2 bg-emerald-600 hover:bg-emerald-500 text-white"
                            disabled={loading}
                        >
                            {loading ? "Authenticating..." : "Login to Terminal"}
                            {!loading && <Lock className="ml-2 size-4" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%  { transform: translateX(-8px); }
                    40%  { transform: translateX(8px); }
                    60%  { transform: translateX(-6px); }
                    80%  { transform: translateX(6px); }
                }
            `}</style>
        </div>
    );
}
