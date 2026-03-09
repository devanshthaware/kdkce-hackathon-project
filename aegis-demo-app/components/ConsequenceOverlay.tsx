"use client";

import { useState, useCallback } from "react";
import { useRiskContext } from "@/lib/riskContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ShieldX, KeyRound, AlertTriangle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── MFA Challenge Overlay ─────────────────────────────────────
function MfaChallenge() {
  const { setMfaRequired, setAlertLevel, addLog } = useRiskContext();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const verify = useCallback(() => {
    // Demo: any 6-digit code works
    if (code.length === 6 && /^\d+$/.test(code)) {
      setMfaRequired(false);
      setAlertLevel(null);
      addLog("INFO", "✅ MFA verification passed. Session re-authenticated.");
    } else {
      setError("Invalid code. Enter any 6-digit number for this demo.");
    }
  }, [code, setMfaRequired, setAlertLevel, addLog]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-orange-500/30 bg-slate-950 shadow-[0_0_80px_rgba(249,115,22,0.25)] p-8 space-y-6">
        {/* Pulsing ring */}
        <div className="absolute -inset-px rounded-2xl border border-orange-500/20 animate-pulse pointer-events-none" />

        <div className="flex flex-col items-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/20">
            <KeyRound className="size-8 text-orange-400" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-orange-300">Identity Verification Required</h2>
            <p className="text-sm text-slate-400 mt-1">
              AegisAuth detected a HIGH-risk signal. Please verify your identity to continue.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-3">
          <p className="text-xs text-orange-400 font-medium uppercase tracking-wider">
            ⚠ Adaptive Policy Triggered
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Your current session risk exceeded the HIGH threshold defined in your active risk policy.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Enter MFA Code</p>
          <Input
            type="text"
            placeholder="6-digit verification code"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(""); }}
            maxLength={6}
            className="bg-slate-900 border-slate-700 text-center text-2xl tracking-[1em] font-mono h-14"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <p className="text-[10px] text-slate-600 text-center">Demo mode: enter any 6-digit number</p>
        </div>

        <Button onClick={verify} className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold h-11">
          Verify Identity
        </Button>
      </div>
    </div>
  );
}

// ─── Access Blocked Overlay ────────────────────────────────────
function AccessBlocked() {
  const { setLocked, setAlertLevel, setRisk, addLog } = useRiskContext();

  const resetSession = useCallback(() => {
    setRisk(null);
    setLocked(false);
    setAlertLevel(null);
    addLog("INFO", "🔄 Session manually reset by administrator. All vectors cleared.");
  }, [setRisk, setLocked, setAlertLevel, addLog]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(239,68,68,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.2)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-red-500/40 bg-slate-950 shadow-[0_0_120px_rgba(239,68,68,0.3)] p-8 space-y-6">
        <div className="absolute -inset-px rounded-2xl border border-red-500/20 animate-pulse pointer-events-none" />

        <div className="flex flex-col items-center gap-4">
          <div className="relative flex size-20 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30">
            <ShieldX className="size-10 text-red-400" />
            <div className="absolute inset-0 rounded-2xl bg-red-500/5 animate-ping" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-red-400 tracking-tight">ACCESS BLOCKED</h2>
            <p className="text-sm text-slate-400 mt-2">
              AegisAuth has locked this session. A CRITICAL risk score was detected and enforcement has been triggered.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 space-y-1">
          <p className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="size-3" /> Threat Classification: CRITICAL
          </p>
          <p className="text-[11px] text-slate-500">
            Your session violated the CRITICAL threshold of the active Convex risk policy. All simulator actions are suspended. Incident has been logged.
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={resetSession}
            variant="outline"
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 h-11 font-bold flex items-center gap-2"
          >
            <RefreshCcw className="size-4" />
            Reset Demo Session
          </Button>
          <p className="text-[10px] text-slate-600 text-center">
            In a production environment, account recovery would require admin intervention.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────
export default function ConsequenceOverlay() {
  const { alertLevel, isLocked, isMfaRequired } = useRiskContext();

  if (isLocked && alertLevel === "CRITICAL") return <AccessBlocked />;
  if (isMfaRequired && alertLevel === "HIGH") return <MfaChallenge />;
  return null;
}
