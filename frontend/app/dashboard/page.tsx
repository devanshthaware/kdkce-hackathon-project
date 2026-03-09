"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { StatCard } from "@/components/dashboard/stat-card"
import { RiskChart } from "@/components/dashboard/risk-chart"
import { ActivityTable } from "@/components/dashboard/activity-table"
import { ProjectInfoCard } from "@/components/dashboard/project-info-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, AlertTriangle, AppWindow, Gauge, Zap, ShieldCheck } from "lucide-react"

export default function DashboardPage() {
  const stats = useQuery(api.sessions.getStats)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Overview</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive security posture and system telemetry.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Risk Events"
          value={stats?.totalSessions.toLocaleString() ?? "..."}
          change="+12.5% from last hour"
          trend="up"
          icon={AlertTriangle}
        />
        <StatCard
          title="Active Sessions"
          value="482"
          change="+12 new sessions"
          trend="neutral"
          icon={Users}
        />
        <StatCard
          title="Threats Blocked"
          value={stats?.highRiskAlerts.toString() ?? "..."}
          change="Real-time protection"
          trend="up"
          icon={ShieldCheck}
        />
        <StatCard
          title="API Usage"
          value="65%"
          change="32.4k / 50k events"
          trend="neutral"
          icon={Zap}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RiskChart />
        </div>
        <Card className="rounded-xl border-border/50 bg-card/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Risk Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {[
                { label: "Low Risk", value: 68, color: "bg-emerald-500" },
                { label: "Medium Risk", value: 22, color: "bg-yellow-500" },
                { label: "High Risk", value: 8, color: "bg-orange-500" },
                { label: "Critical", value: 2, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">{item.label}</span>
                    <span className="font-mono font-bold">{item.value}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-secondary/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.2)]`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card className="rounded-xl border-border/50 bg-card/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Threat Logs</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </CardHeader>
            <CardContent>
              <ActivityTable />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <ProjectInfoCard />
        </div>
      </div>
    </div>
  )
}
