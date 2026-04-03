"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { StatCard } from "@/components/dashboard/stat-card"
import { RiskChart } from "@/components/dashboard/risk-chart"
import { ActivityTable } from "@/components/dashboard/activity-table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  ArrowLeft,
  Settings,
  Shield,
  Clock,
  Globe,
  Terminal
} from "lucide-react"
import Link from "next/link"

export default function ApplicationDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const appId = params.appId as Id<"applications">

  const app = useQuery(api.applications.getApp, { id: appId })
  const stats = useQuery(api.sessions.getStats, { applicationId: appId })
  const policies = useQuery(api.riskPolicies.list)
  
  const currentPolicy = policies?.find(p => p._id === app?.riskPolicyId)

  if (app === undefined || stats === undefined) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center gap-4 text-muted-foreground">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="animate-pulse italic text-sm">Initializing application environment...</p>
      </div>
    )
  }

  if (app === null) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center gap-4">
        <AlertTriangle className="size-12 text-destructive" />
        <h1 className="text-xl font-bold">Application Not Found</h1>
        <p className="text-muted-foreground text-sm">You don't have access to this application or it doesn't exist.</p>
        <Button asChild className="mt-2 rounded-xl">
          <Link href="/dashboard/applications">Back to Applications</Link>
        </Button>
      </div>
    )
  }

  const riskLevels = stats?.riskDistribution
    ? [
        { label: "Low Risk", value: stats.riskDistribution.low, color: "bg-emerald-500" },
        { label: "Medium Risk", value: stats.riskDistribution.medium, color: "bg-yellow-500" },
        { label: "High Risk", value: stats.riskDistribution.high, color: "bg-orange-500" },
        { label: "Critical", value: stats.riskDistribution.critical, color: "bg-red-500" },
      ]
    : []

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          <ChevronRight className="size-3" />
          <Link href="/dashboard/applications" className="hover:text-foreground transition-colors">Applications</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">{app.name}</span>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary shadow-inner">
              <Shield className="size-6" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{app.name}</h1>
                <Badge variant="outline" className={
                  app.environment === "Production" 
                    ? "border-success/20 bg-success/10 text-success" 
                    : "border-warning/20 bg-warning/10 text-warning"
                }>
                  {app.environment}
                </Badge>
                <Badge variant="secondary" className="bg-secondary/50">
                  {app.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-lg">
                Isolated security monitoring and risk assessment for {app.name}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl gap-2 border-border/60 hover:bg-secondary/50" asChild>
              <Link href="/dashboard/settings">
                <Settings className="size-4" />
                Configure
              </Link>
            </Button>
            <Button className="rounded-xl gap-2" onClick={() => router.push('/dashboard/applications')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value={stats?.totalSessions.toLocaleString() ?? "0"}
          change="Total sessions tracked"
          trend="neutral"
          icon={AlertTriangle}
        />
        <StatCard
          title="Active Sessions"
          value={stats?.activeSessions?.toLocaleString() ?? "0"}
          change="Last 24 hours"
          trend="neutral"
          icon={Users}
        />
        <StatCard
          title="Threats Blocked"
          value={stats?.highRiskAlerts.toString() ?? "0"}
          change="Automated enforcement"
          trend={stats?.highRiskAlerts ? "up" : "neutral"}
          icon={ShieldCheck}
        />
        <StatCard
          title="Avg Risk Score"
          value={stats?.avgRiskScore?.toString() ?? "0"}
          change="Across all signals"
          trend="neutral"
          icon={Zap}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Analytics Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <RiskChart applicationId={appId} />
          
          <Card className="rounded-2xl border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base font-semibold">Live Traffic Audit</CardTitle>
                <CardDescription className="text-xs">Real-time session monitoring for this application</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-primary hover:bg-primary/5" asChild>
                <Link href="/dashboard/sessions">Historical Data</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ActivityTable applicationId={appId} />
              {stats?.totalSessions === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="size-12 rounded-full bg-secondary/30 flex items-center justify-center mb-4 text-muted-foreground/40">
                    <Clock className="size-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">No activity for this application</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
                    Ensure your SDK is correctly initialized with the proper credentials.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Context Section */}
        <div className="flex flex-col gap-6">
          <Card className="rounded-2xl border-border/50 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Application Profile</CardTitle>
              <CardDescription>System metadata and identifiers</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {[
                  { label: "App ID", icon: Terminal, value: app.appId },
                  { label: "Environment", icon: Globe, value: app.environment },
                  { label: "Status", icon: ShieldCheck, value: app.status },
                  { label: "Created At", icon: Clock, value: new Date(app._creationTime).toLocaleDateString() },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/30 bg-secondary/10 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <item.icon className="size-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-xs font-mono font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-card/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Risk Policy</CardTitle>
              <CardDescription>Current assessment thresholds</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{currentPolicy?.name || "Standard Policy"}</span>
                <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase font-bold">
                  {app.mlEnhancement ? "ML Active" : "Heuristic"}
                </Badge>
              </div>
              
              <div className="flex flex-col gap-4">
                {riskLevels.map((item) => (
                  <div key={item.label} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">{item.label}</span>
                      <span className="font-mono font-bold">{item.value}% profile</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-secondary/50 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.1)] transition-all duration-700`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border/30 bg-secondary/10 p-4">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Policy Description</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentPolicy?.description || "Using system wide default risk assessment settings for this application."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
