"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

const tooltipStyle = {
  backgroundColor: "rgba(10, 11, 15, 0.95)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "1rem",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  padding: "16px",
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={tooltipStyle} className="flex flex-col gap-3 min-w-[140px] border-none shadow-2xl">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-white/5 pb-2 mb-1">{label} - Risk Volume</p>
        <div className="flex flex-col gap-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div className="size-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}44` }} />
                <span className="text-xs font-semibold text-white/90 capitalize">{entry.name}</span>
              </div>
              <span className="text-xs font-mono font-bold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

import { useOrganization } from "@/components/providers/organization-provider"

export function RiskChart() {
  const { activeOrganization } = useOrganization()
  const analytics = useQuery(
    api.sessions.getAnalytics,
    activeOrganization ? { organizationId: activeOrganization } : "skip"
  )
  const data = analytics?.hourlyRiskDist ?? []

  return (
    <Card className="rounded-[2rem] border-border/40 bg-card/40 shadow-2xl backdrop-blur-md overflow-hidden transition-all hover:bg-card/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Risk Distribution (24h)</CardTitle>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" /> Low
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
              <span className="size-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]" /> Med
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
              <span className="size-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" /> High
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64 mt-4">
          {!analytics ? (
            <div className="flex h-full items-center justify-center text-muted-foreground italic text-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="animate-pulse">Analyzing telemetry...</span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="rgba(255,255,255,0.2)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  interval={3}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.2)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  hide
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                <Area
                  type="monotone"
                  dataKey="low"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorLow)"
                  animationDuration={2000}
                />
                <Area
                  type="monotone"
                  dataKey="medium"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMedium)"
                  animationDuration={2500}
                />
                <Area
                  type="monotone"
                  dataKey="high"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorHigh)"
                  animationDuration={3000}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
