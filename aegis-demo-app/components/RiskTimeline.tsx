"use client";

import { useRiskContext, type RiskTimelinePoint } from "@/lib/riskContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const LEVEL_COLOR: Record<string, string> = {
  LOW:      "#10b981",
  MEDIUM:   "#f59e0b",
  HIGH:     "#f97316",
  CRITICAL: "#ef4444",
};

const LEVEL_FILL: Record<string, string> = {
  LOW:      "rgba(16,185,129,0.15)",
  MEDIUM:   "rgba(245,158,11,0.15)",
  HIGH:     "rgba(249,115,22,0.18)",
  CRITICAL: "rgba(239,68,68,0.2)",
};

function buildSvgPath(points: RiskTimelinePoint[], W: number, H: number) {
  if (points.length === 0) return { line: "", area: "" };
  const pad = 8;
  const xs = points.map((_, i) => pad + (i / Math.max(points.length - 1, 1)) * (W - pad * 2));
  const ys = points.map(p => H - pad - p.score * (H - pad * 2));

  let line = `M ${xs[0]} ${ys[0]}`;
  for (let i = 1; i < points.length; i++) {
    // Smooth cubic bezier
    const cx1 = (xs[i - 1] + xs[i]) / 2;
    line += ` C ${cx1} ${ys[i - 1]}, ${cx1} ${ys[i]}, ${xs[i]} ${ys[i]}`;
  }
  const area = line + ` L ${xs[xs.length - 1]} ${H} L ${xs[0]} ${H} Z`;
  return { line, area };
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-6">
      {/* Animated pulse bars */}
      <div className="flex items-end gap-1.5 h-14">
        {[3, 6, 4, 8, 5, 9, 6, 7, 4, 5, 8, 6, 3, 5].map((h, i) => (
          <div
            key={i}
            className="w-2 rounded-t-sm bg-emerald-500/20 animate-pulse"
            style={{
              height: `${h * 6}px`,
              animationDelay: `${i * 80}ms`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </div>
      <p className="text-[11px] text-slate-600 font-mono text-center">
        Waiting for telemetry markers...<br />
        <span className="text-emerald-500/40">Trigger an attack vector to begin recording</span>
      </p>
    </div>
  );
}

export default function RiskTimeline() {
  const { riskHistory } = useRiskContext();

  const W = 420, H = 120;
  const latest = riskHistory[riskHistory.length - 1];
  const peak   = riskHistory.reduce((m, p) => p.score > m ? p.score : m, 0);
  const avg    = riskHistory.length ? riskHistory.reduce((s, p) => s + p.score, 0) / riskHistory.length : 0;
  const dominantLevel = latest?.level ?? "SAFE";

  const { line, area } = useMemo(() => buildSvgPath(riskHistory, W, H), [riskHistory]);

  // Y-axis labels
  const yLabels = [100, 75, 50, 25, 0];

  return (
    <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl shadow-2xl h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <Activity className="size-3.5 text-emerald-500" />
            Session Risk Timeline
          </CardTitle>
          {riskHistory.length > 0 && (
            <Badge
              variant="outline"
              className="text-[9px] font-bold uppercase"
              style={{
                borderColor: `${LEVEL_COLOR[dominantLevel]}40`,
                backgroundColor: `${LEVEL_COLOR[dominantLevel]}15`,
                color: LEVEL_COLOR[dominantLevel],
              }}
            >
              {dominantLevel}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {riskHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* SVG Chart */}
            <div className="relative rounded-xl overflow-hidden border border-white/5 bg-slate-950/50">
              {/* Y-axis labels */}
              <div className="absolute left-2 inset-y-0 flex flex-col justify-between py-2 z-10">
                {yLabels.map(v => (
                  <span key={v} className="text-[8px] text-slate-700 font-mono leading-none">{v}</span>
                ))}
              </div>

              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full"
                style={{ height: 130 }}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={LEVEL_COLOR[dominantLevel]} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={LEVEL_COLOR[dominantLevel]} stopOpacity="0.01" />
                  </linearGradient>
                  {/* Subtle grid */}
                  <pattern id="grid" width="42" height="30" patternUnits="userSpaceOnUse">
                    <path d={`M ${W} 0 L 0 0 0 ${H}`} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  </pattern>
                </defs>

                {/* Grid */}
                <rect width={W} height={H} fill="url(#grid)" />

                {/* Horizontal risk threshold lines */}
                {[
                  { y: 0.85 * H, label: "CRIT", color: "#ef4444" },
                  { y: 0.60 * H, label: "HIGH", color: "#f97316" },
                  { y: 0.35 * H, label: "MED",  color: "#f59e0b" },
                ].map(({ y, label, color }) => (
                  <g key={label}>
                    <line x1="18" y1={H - y} x2={W} y2={H - y} stroke={color} strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3" />
                  </g>
                ))}

                {/* Gradient fill */}
                <path d={area} fill="url(#areaGrad)" />

                {/* Main line */}
                <path
                  d={line}
                  fill="none"
                  stroke={LEVEL_COLOR[dominantLevel]}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Dots for each datapoint */}
                {riskHistory.map((point, i) => {
                  const x = 8 + (i / Math.max(riskHistory.length - 1, 1)) * (W - 16);
                  const y = H - 8 - point.score * (H - 16);
                  const color = LEVEL_COLOR[point.level] ?? "#10b981";
                  return (
                    <g key={point.t}>
                      <circle cx={x} cy={y} r="3.5" fill={color} opacity="0.9" />
                      <circle cx={x} cy={y} r="6" fill={color} opacity="0.15" />
                    </g>
                  );
                })}

                {/* Latest point pulsing circle */}
                {(() => {
                  const last = riskHistory[riskHistory.length - 1];
                  if (!last) return null;
                  const x = W - 8;
                  const y = H - 8 - last.score * (H - 16);
                  const color = LEVEL_COLOR[last.level] ?? "#10b981";
                  return (
                    <g>
                      <circle cx={x} cy={y} r="8" fill={color} opacity="0.1">
                        <animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={x} cy={y} r="3.5" fill={color} />
                    </g>
                  );
                })()}
              </svg>

              {/* X-axis time labels */}
              <div className="flex justify-between px-4 pb-1">
                {riskHistory.length > 1 && [0, Math.floor(riskHistory.length / 2), riskHistory.length - 1].map(idx => (
                  <span key={idx} className="text-[8px] text-slate-700 font-mono">
                    {new Date(riskHistory[idx].t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "CURRENT", value: `${Math.round((latest?.score ?? 0) * 100)}%`, color: LEVEL_COLOR[dominantLevel] },
                { label: "PEAK",    value: `${Math.round(peak * 100)}%`,  color: "#ef4444"  },
                { label: "AVG",     value: `${Math.round(avg * 100)}%`,   color: "#94a3b8"  },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-lg border border-white/5 bg-slate-800/40 p-2 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">{label}</p>
                  <p className="text-lg font-black tabular-nums" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Level event log */}
            <div className="flex flex-wrap gap-1.5">
              {[...new Set(riskHistory.map(p => p.level))].map(level => {
                const count = riskHistory.filter(p => p.level === level).length;
                return (
                  <span
                    key={level}
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      color: LEVEL_COLOR[level],
                      borderColor: `${LEVEL_COLOR[level]}30`,
                      backgroundColor: `${LEVEL_COLOR[level]}10`,
                    }}
                  >
                    {level} ×{count}
                  </span>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
