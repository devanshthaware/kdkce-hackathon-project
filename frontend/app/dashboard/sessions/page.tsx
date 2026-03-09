"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RiskBadge } from "@/components/dashboard/risk-badge"
import { Radio, Eye, Search, ArrowUpDown, X } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

type SessionStatus = "safe" | "suspicious" | "blocked"

interface Session {
  userEmail: string
  device: string
  browser: string
  location: string
  ip: string
  riskScore: number
  status: SessionStatus
  loginTime: string
}

type SortField = "user" | "riskScore" | "status" | null
type SortDir = "asc" | "desc"

const statusOrder: Record<SessionStatus, number> = { safe: 0, suspicious: 1, blocked: 2 }

export default function SessionsPage() {
  const sessionsList = useQuery(api.sessions.list, {})
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [statusFilter, setStatusFilter] = useState<SessionStatus | "all">("all")
  const [detailSession, setDetailSession] = useState<any | null>(null)

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const filtered = useMemo(() => {
    if (!sessionsList) return []
    let data = [...sessionsList]
    if (statusFilter !== "all") {
      data = data.filter((s) => s.status === statusFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (s) =>
          s.userEmail.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.ip.includes(q) ||
          s.device.toLowerCase().includes(q)
      )
    }
    if (sortField) {
      data.sort((a, b) => {
        let cmp = 0
        if (sortField === "user") cmp = a.userEmail.localeCompare(b.userEmail)
        else if (sortField === "riskScore") cmp = a.riskScore - b.riskScore
        else if (sortField === "status") cmp = statusOrder[a.status as SessionStatus] - statusOrder[b.status as SessionStatus]
        return sortDir === "desc" ? -cmp : cmp
      })
    }
    return data as any[]
  }, [sessionsList, search, sortField, sortDir, statusFilter])

  const safeCount = sessionsList?.filter((s) => s.status === "safe").length || 0
  const suspiciousCount = sessionsList?.filter((s) => s.status === "suspicious").length || 0
  const blockedCount = sessionsList?.filter((s) => s.status === "blocked").length || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Monitor active sessions and risk scores in real time.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-success">
          <Radio className="size-4 animate-pulse" />
          <span>Live Monitoring</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <button onClick={() => setStatusFilter(statusFilter === "safe" ? "all" : "safe")} className="text-left">
          <Card className={`rounded-xl border-border/50 bg-card transition-colors ${statusFilter === "safe" ? "ring-2 ring-success/50" : "hover:border-success/30"}`}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Safe Sessions</p>
                <p className="text-2xl font-bold text-success">{safeCount}</p>
              </div>
              <div className="size-3 rounded-full bg-success/20 ring-4 ring-success/10" />
            </CardContent>
          </Card>
        </button>
        <button onClick={() => setStatusFilter(statusFilter === "suspicious" ? "all" : "suspicious")} className="text-left">
          <Card className={`rounded-xl border-border/50 bg-card transition-colors ${statusFilter === "suspicious" ? "ring-2 ring-warning/50" : "hover:border-warning/30"}`}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Suspicious</p>
                <p className="text-2xl font-bold text-warning">{suspiciousCount}</p>
              </div>
              <div className="size-3 rounded-full bg-warning/20 ring-4 ring-warning/10" />
            </CardContent>
          </Card>
        </button>
        <button onClick={() => setStatusFilter(statusFilter === "blocked" ? "all" : "blocked")} className="text-left">
          <Card className={`rounded-xl border-border/50 bg-card transition-colors ${statusFilter === "blocked" ? "ring-2 ring-destructive/50" : "hover:border-destructive/30"}`}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-2xl font-bold text-destructive">{blockedCount}</p>
              </div>
              <div className="size-3 rounded-full bg-destructive/20 ring-4 ring-destructive/10" />
            </CardContent>
          </Card>
        </button>
      </div>

      <Card className="rounded-xl border-border/50 bg-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Active Sessions</CardTitle>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>
                  <Button variant="ghost" size="sm" className="gap-1 -ml-3 text-muted-foreground hover:text-foreground" onClick={() => toggleSort("user")}>
                    User <ArrowUpDown className="size-3" />
                  </Button>
                </TableHead>
                <TableHead>Device</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="gap-1 -ml-3 text-muted-foreground hover:text-foreground" onClick={() => toggleSort("riskScore")}>
                    Risk Score <ArrowUpDown className="size-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" size="sm" className="gap-1 -ml-3 text-muted-foreground hover:text-foreground" onClick={() => toggleSort("status")}>
                    Status <ArrowUpDown className="size-3" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No sessions match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((session) => (
                  <TableRow key={session._id} className="border-border/30">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{session.userEmail}</span>
                        <span className="text-xs text-muted-foreground">{session.ip}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{session.device}</span>
                        <span className="text-xs text-muted-foreground">{session.browser}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{session.location}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-medium">{session.riskScore}</span>
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={session.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setDetailSession(session)}
                      >
                        <Eye className="size-4" />
                        <span className="sr-only">View session details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Session Detail Dialog */}
      <Dialog open={!!detailSession} onOpenChange={(open) => !open && setDetailSession(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {detailSession && (
            <div className="flex flex-col gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">User</span>
                  <span className="text-sm font-medium">{detailSession.userEmail}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">IP Address</span>
                  <span className="text-sm font-mono">{detailSession.ip}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Device</span>
                  <span className="text-sm">{detailSession.device}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Browser</span>
                  <span className="text-sm">{detailSession.browser}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Location</span>
                  <span className="text-sm">{detailSession.location}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Login Time</span>
                  <span className="text-sm font-mono">{detailSession.loginTime}</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/30 p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Risk Score</span>
                  <span className="text-2xl font-bold font-mono">{detailSession.riskScore}</span>
                </div>
                <RiskBadge level={detailSession.status} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
