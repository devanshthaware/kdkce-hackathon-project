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
import { MoreHorizontal, RotateCw, Trash2, Key, Info } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"


const columns = [
  { header: "Project", accessor: "project" as const, className: "font-semibold text-slate-100" },
  { 
    header: "API Key", 
    accessor: (item: any) => (
      <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400 text-xs font-mono">
        {item.key}
      </code>
    )
  },
  { header: "Created Date", accessor: "created" as const },
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
          <DropdownMenuLabel>Key Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
            <RotateCw className="mr-2 h-4 w-4" />
            Rotate Key
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
            <Info className="mr-2 h-4 w-4" />
            View Permissions
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer text-rose-400 focus:text-rose-400">
            <Trash2 className="mr-2 h-4 w-4" />
            Revoke Key
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    className: "text-right"
  }
]

export default function APIKeysManagement() {
  const projects = useQuery(api.admin.getProjects)
  
  const apiKeys = projects?.map(p => ({
    id: p.id,
    project: p.name,
    key: "ak_live_••••••••" + Math.random().toString(36).substring(2, 6), // In real app, keys would be in a separate table or masked by server
    created: "2024-03-01", // Placeholder, ideally in schema
    status: p.status
  }))
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">API Keys</h1>
          <p className="text-slate-400 mt-1">Manage and audit security credentials for all platform applications.</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
          <Key className="mr-2 h-4 w-4" />
          Issue Special Key
        </Button>
      </div>

      <AdminTable columns={columns} data={apiKeys ?? []} />
    </div>
  )
}
