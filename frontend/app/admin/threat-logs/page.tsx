"use client"

import { AdminTable } from "@/components/admin/AdminTable"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"


const columns = [
  { header: "Timestamp", accessor: "timestamp" as const, className: "font-mono text-slate-500" },
  { header: "Project", accessor: "project" as const, className: "font-semibold" },
  { 
    header: "Risk Score", 
    accessor: (item: any) => (
      <div className="flex items-center gap-2">
        <div className={`h-2 w-12 rounded-full overflow-hidden bg-slate-800`}>
          <div 
            className={`h-full ${item.riskScore > 80 ? "bg-rose-500 shadow-[0_0_8px_theme(colors.rose.500)]" : item.riskScore > 60 ? "bg-orange-500" : "bg-yellow-500"}`}
            style={{ width: `${item.riskScore}%` }}
          />
        </div>
        <span className="font-mono text-xs font-bold w-6">{item.riskScore}</span>
      </div>
    )
  },
  { header: "Event Type", accessor: "type" as const },
  { 
    header: "Status", 
    accessor: (item: any) => <StatusBadge status={item.status} /> 
  },
]

export default function ThreatLogs() {
  const threatLogs = useQuery(api.admin.getThreatLogs, { limit: 50 })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Threat Logs</h1>
          <p className="text-slate-400 mt-1">Real-time security events and intelligence stream.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="bg-slate-950/30 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="size-4 text-emerald-400" />
              Live Security Feed
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <AdminTable columns={columns} data={threatLogs ?? []} />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
