"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Globe, ShieldCheck } from "lucide-react";

export default function DeviceInfoCard() {
    return (
        <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader>
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    Device Trust Profile
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Laptop className="size-5 text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Endpoint Access</div>
                        <div className="text-sm text-white font-bold">Unknown MacBook Pro</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 text-slate-300">
                    <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Globe className="size-5 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Network Interface</div>
                        <div className="text-sm font-mono font-bold">192.168.1.1 (Verified)</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20">
                    <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <ShieldCheck className="size-5 text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-xs text-emerald-500/60 font-black uppercase tracking-widest">Environment Status</div>
                        <div className="text-sm text-emerald-400 font-black">Secure Context Verified</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
