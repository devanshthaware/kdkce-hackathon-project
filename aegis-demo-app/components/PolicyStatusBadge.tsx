"use client";

import { useRiskContext } from "@/lib/riskContext";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PolicyStatusBadge() {
  const { activePolicy } = useRiskContext();

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1">
      <ShieldCheck className="size-3 text-emerald-400 shrink-0" />
      <span className="text-[11px] font-semibold text-emerald-300 truncate max-w-[180px]">
        {activePolicy?.name ?? "Loading policy..."}
      </span>
      <span className="text-[10px] text-slate-500">
        · H:{Math.round((activePolicy?.thresholds.high ?? 0.6) * 100)}% C:{Math.round((activePolicy?.thresholds.critical ?? 0.85) * 100)}%
      </span>
    </div>
  );
}
