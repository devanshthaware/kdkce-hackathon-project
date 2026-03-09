"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Lock, CreditCard, Package, ShieldCheck, Eye, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRiskContext } from "@/lib/riskContext";

const VAULT_ITEMS = [
  { icon: CreditCard, label: "Payment Cards", count: 3, sensitive: true },
  { icon: Package, label: "API Secrets", count: 8, sensitive: true },
  { icon: Eye, label: "User PII Records", count: 1247, sensitive: true },
  { icon: AlertTriangle, label: "Fraud Reports", count: 12, sensitive: false },
];

function VaultContent() {
  const { risk, activePolicy } = useRiskContext();
  const score = risk ? Math.round(risk.risk_score * 100) : 0;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Lock className="size-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Secure Vault</h1>
              <p className="text-sm text-slate-400">AegisAuth — Protected Route Sandbox</p>
            </div>
          </div>

          {/* Access Granted Banner */}
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 mt-4">
            <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-300">Route Access Granted</p>
              <p className="text-xs text-slate-500">
                AegisAuth intercepted this navigation and verified your risk score ({score}%) against the active policy "{activePolicy?.name}".
              </p>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] shrink-0">VERIFIED</Badge>
          </div>
        </div>

        {/* Vault Contents */}
        <div className="grid gap-4 sm:grid-cols-2">
          {VAULT_ITEMS.map(({ icon: Icon, label, count, sensitive }) => (
            <Card key={label} className="bg-slate-900/40 border-white/10">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-slate-800 border border-white/5">
                      <Icon className="size-4 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="text-2xl font-black text-slate-100 mt-0.5">{count.toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={sensitive
                      ? "border-red-500/30 bg-red-500/10 text-red-400 text-[9px]"
                      : "border-slate-600 text-slate-500 text-[9px]"}
                  >
                    {sensitive ? "Sensitive" : "Standard"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-slate-600 text-center">
          This is a simulated vault. The data above is fake. In a real app, this page would be wrapped
          with an <code className="text-emerald-500">{"<AegisProtect>"}</code> route guard.
        </p>
      </div>
    </div>
  );
}

export default function VaultPage() {
  return (
    <ProtectedRoute requiredLevel="MEDIUM">
      <VaultContent />
    </ProtectedRoute>
  );
}
