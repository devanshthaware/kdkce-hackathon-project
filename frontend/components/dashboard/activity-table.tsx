"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RiskBadge } from "./risk-badge"
import { ArrowUpDown, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatDistanceToNow } from "date-fns"

type RiskLevel = "low" | "medium" | "high" | "critical"

const riskOrder: Record<string, number> = { low: 0, medium: 1, safe: 0, suspicious: 2, high: 2, blocked: 3, critical: 3 }

type SortField = "user" | "risk" | "time" | null
type SortDir = "asc" | "desc"

export function ActivityTable() {
  const activities = useQuery(api.activities.list, {})
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const filtered = useMemo(() => {
    if (!activities) return []
    let data = [...activities]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (a) =>
          a.userEmail.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.device.toLowerCase().includes(q)
      )
    }
    if (sortField) {
      data.sort((a, b) => {
        let cmp = 0
        if (sortField === "user") cmp = a.userEmail.localeCompare(b.userEmail)
        else if (sortField === "risk") cmp = (riskOrder[a.risk] || 0) - (riskOrder[b.risk] || 0)
        else if (sortField === "time") cmp = a.timestamp - b.timestamp
        return sortDir === "desc" ? -cmp : cmp
      })
    }
    return data
  }, [activities, search, sortField, sortDir])

  if (activities === undefined) {
    return <div className="py-8 text-center text-muted-foreground">Loading activity...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter activity..."
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
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead>
              <Button variant="ghost" size="sm" className="gap-1 -ml-3 text-muted-foreground hover:text-foreground" onClick={() => toggleSort("user")}>
                User <ArrowUpDown className="size-3" />
              </Button>
            </TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="hidden md:table-cell">Device</TableHead>
            <TableHead className="hidden lg:table-cell">Location</TableHead>
            <TableHead>
              <Button variant="ghost" size="sm" className="gap-1 -ml-3 text-muted-foreground hover:text-foreground" onClick={() => toggleSort("risk")}>
                Risk <ArrowUpDown className="size-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button variant="ghost" size="sm" className="gap-1 -mr-3 text-muted-foreground hover:text-foreground" onClick={() => toggleSort("time")}>
                Time <ArrowUpDown className="size-3" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                No matching activity found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((activity) => (
              <TableRow key={activity._id} className="border-border/30">
                <TableCell className="font-medium">{activity.userEmail}</TableCell>
                <TableCell className="text-muted-foreground">{activity.action}</TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{activity.device}</TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">{activity.location}</TableCell>
                <TableCell>
                  <RiskBadge level={activity.risk as any} />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
