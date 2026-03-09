"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"

const anomalyData = [
  { hour: "00:00", anomalies: 2, baseline: 5 },
  { hour: "03:00", anomalies: 1, baseline: 3 },
  { hour: "06:00", anomalies: 4, baseline: 8 },
  { hour: "09:00", anomalies: 12, baseline: 15 },
  { hour: "12:00", anomalies: 18, baseline: 20 },
  { hour: "15:00", anomalies: 15, baseline: 18 },
  { hour: "18:00", anomalies: 8, baseline: 12 },
  { hour: "21:00", anomalies: 5, baseline: 7 },
]

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
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-white/5 pb-2 mb-1">{label}</p>
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

export default function AnalyticsPage() {
  const { activeOrganization } = useOrganization()
  const analytics = useQuery(
    api.sessions.getAnalytics,
    activeOrganization ? { organizationId: activeOrganization } : "skip"
  )

  if (!analytics) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center gap-4 text-muted-foreground">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="animate-pulse italic">Analyzing security data...</p>
      </div>
    )
  }

  const { riskDist, deviceTrust } = analytics

  const handleExportCSV = () => {
    // Header
    const headers = ["Day", "Risk: Low", "Risk: Medium", "Risk: High", "Risk: Critical", "Device: Trusted", "Device: Unknown", "Device: Untrusted"]

    // Rows
    const rows = (riskDist as any[]).map((rd, i) => {
      const dt = (deviceTrust as any[])[i]
      return [
        rd.day,
        rd.low,
        rd.medium,
        rd.high,
        rd.critical,
        dt?.trusted || 0,
        dt?.unknown || 0,
        dt?.untrusted || 0
      ]
    })

    // Combine
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `aegis_analytics_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Analytics</h1>
          <p className="text-sm text-muted-foreground">Deep dive into risk patterns and system health.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="rounded-xl border-border/50 bg-card/50 hover:bg-accent/50 transition-all font-semibold gap-2"
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      <svg width="0" height="0" className="hidden">
        <defs>
          <linearGradient id="riskLow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="riskMedium" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="riskHigh" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="riskCritical" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9f1239" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#9f1239" stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id="trustGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[2rem] border-border/40 bg-card/40 shadow-2xl backdrop-blur-md overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Weekly Risk Distribution</CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-50">Weekly risk level breakdown across all sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDist} barSize={16} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="low" fill="url(#riskLow)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="medium" fill="url(#riskMedium)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="high" fill="url(#riskHigh)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="critical" fill="url(#riskCritical)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/40 bg-card/40 shadow-2xl backdrop-blur-md overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Device Trust Trends</CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-50">Device trust levels over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={deviceTrust}>
                  <defs>
                    <linearGradient id="colorTrusted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="trusted" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTrusted)" />
                  <Area type="monotone" dataKey="unknown" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
                  <Area type="monotone" dataKey="untrusted" stroke="#f43f5e" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/40 bg-card/40 shadow-2xl backdrop-blur-md overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Login Anomaly Trends</CardTitle>
            <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-50">Anomalous login patterns vs. baseline (24h)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={anomalyData}>
                  <defs>
                    <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgba(255,255,255,0.2)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="rgba(255,255,255,0.2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="baseline" stroke="rgba(255,255,255,0.3)" fill="url(#colorBaseline)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="anomalies" stroke="#8b5cf6" fill="url(#anomalyGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
