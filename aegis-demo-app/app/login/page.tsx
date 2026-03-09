"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Lock } from "lucide-react";
import { aegisClient } from "@/lib/sdk";
import { useRiskContext } from "@/lib/riskContext";
import { useUser } from "@clerk/nextjs";

export default function LoginPage() {
    const router = useRouter();
    const { user } = useUser();
    const { setRisk, addLog } = useRiskContext();
    const [loading, setLoading] = useState(false);
    const [flags, setFlags] = useState({
        newDevice: false,
        countryChange: false,
        vpnMode: false,
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        addLog("INFO", "Initiating login protection sequence...");

        try {
            const risk = await aegisClient.protectLogin({
                userId: user?.id || "demo_user",
                email: user?.primaryEmailAddress?.emailAddress || "demo@aegis.local",
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
                // The AlertModal in layout/dashboard will handle the UI
                addLog("WARN", "High-risk signals detected. Access restricted.");
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            addLog("ERROR", "Login protection service unavailable.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Shield className="size-6 text-primary fill-current" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">AegisAuth Demo</CardTitle>
                    <CardDescription>Enter credentials to access the secure terminal</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="admin@enterprise.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required />
                        </div>

                        <div className="pt-4 space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Simulation vectors</Label>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label htmlFor="new-device">New Device</Label>
                                    <p className="text-[10px] text-muted-foreground">Simulate login from unrecognized hardware</p>
                                </div>
                                <Switch
                                    id="new-device"
                                    checked={flags.newDevice}
                                    onCheckedChange={(c) => setFlags(f => ({ ...f, newDevice: c }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label htmlFor="country">Country Change</Label>
                                    <p className="text-[10px] text-muted-foreground">Simulate geo-velocity anomaly</p>
                                </div>
                                <Switch
                                    id="country"
                                    checked={flags.countryChange}
                                    onCheckedChange={(c) => setFlags(f => ({ ...f, countryChange: c }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                                <div className="space-y-0.5">
                                    <Label htmlFor="vpn">VPN Mode</Label>
                                    <p className="text-[10px] text-muted-foreground">Simulate masked egress point</p>
                                </div>
                                <Switch
                                    id="vpn"
                                    checked={flags.vpnMode}
                                    onCheckedChange={(c) => setFlags(f => ({ ...f, vpnMode: c }))}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11 font-bold text-lg mt-6" disabled={loading}>
                            {loading ? "Authenticating..." : "Login to Terminal"}
                            {!loading && <Lock className="ml-2 size-4" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
