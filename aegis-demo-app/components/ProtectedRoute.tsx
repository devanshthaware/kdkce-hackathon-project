"use client";

import { useRiskContext } from "@/lib/riskContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, ShieldX } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredLevel?: "LOW" | "MEDIUM"; // max allowed risk level
}

const RISK_ORDER = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ProtectedRoute({ children, requiredLevel = "MEDIUM" }: ProtectedRouteProps) {
  const { risk, isLocked, addLog } = useRiskContext();
  const router = useRouter();

  const currentLevel = risk?.risk_level ?? "LOW";
  const currentIndex = RISK_ORDER.indexOf(currentLevel);
  const requiredIndex = RISK_ORDER.indexOf(requiredLevel);
  const isBlocked = isLocked || currentIndex > requiredIndex;

  useEffect(() => {
    if (isBlocked) {
      addLog("ERROR", `🚫 Route access denied. Current risk "${currentLevel}" exceeds the maximum allowed "${requiredLevel}".`);
    } else {
      addLog("SECURITY", `✅ Route access granted. Risk level "${currentLevel}" within acceptable range.`);
    }
  }, [isBlocked, currentLevel]);

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative mx-auto flex size-24 items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/30">
            <ShieldX className="size-12 text-red-400" />
            <div className="absolute inset-0 rounded-3xl animate-ping bg-red-500/5" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-red-400 tracking-tight">Access Denied</h1>
            <p className="text-slate-400 mt-2 text-sm">
              AegisAuth blocked navigation to this route. Your current risk score is{" "}
              <span className="text-red-400 font-bold">{currentLevel}</span>, which exceeds the maximum
              allowed level of <span className="text-slate-200 font-bold">{requiredLevel}</span>.
            </p>
          </div>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-left space-y-1">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Why was I blocked?</p>
            <p className="text-xs text-slate-500">
              Sensitive routes are wrapped with the <code className="text-emerald-400">{"<ProtectedRoute>"}</code> component from the AegisAuth SDK. It intercepts navigation and evaluates risk in real-time before granting access.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-semibold transition-colors"
          >
            ← Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
