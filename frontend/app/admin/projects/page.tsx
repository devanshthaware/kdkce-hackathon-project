"use client"

import { AdminTable } from "@/components/admin/AdminTable"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Ban, FileText, RefreshCw, Layers } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"


const columns = [
  { header: "Project Name", accessor: "name" as const, className: "font-semibold text-slate-100" },
  { header: "Owner", accessor: "owner" as const },
  { header: "API Requests", accessor: "requests" as const, className: "text-center" },
  { 
    header: "Threat Events", 
    accessor: (item: any) => (
      <span className={`font-mono ${item.threats > 50 ? "text-rose-400" : item.threats > 10 ? "text-yellow-400" : "text-slate-400"}`}>
        {item.threats}
      </span>
    ),
    className: "text-center"
  },
  { 
    header: "Status", 
    accessor: (item: any) => <StatusBadge status={item.status} /> 
  },
  {
    header: "Actions",
    accessor: (item: any) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-800">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300">
          <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            View Logs
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            Rotate API Key
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer text-rose-400 focus:text-rose-400">
            <Ban className="mr-2 h-4 w-4" />
            Disable Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    className: "text-right"
  }
]

export default function ProjectsManagement() {
  const projects = useQuery(api.admin.getProjects)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Projects</h1>
          <p className="text-slate-400 mt-1">Cross-platform application monitoring and management.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800">
            <Layers className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <AdminTable columns={columns} data={projects ?? []} />
    </div>
  )
}
