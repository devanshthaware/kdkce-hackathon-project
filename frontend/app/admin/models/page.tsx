"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminTable } from "@/components/admin/AdminTable"
import { StatusBadge } from "@/components/admin/StatusBadge"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Cpu, Save, RotateCcw } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"


export default function MLModels() {
  const models = useQuery(api.admin.getModelSettings)
  const updateWeight = useMutation(api.admin.updateModelWeight)

  const handleWeightChange = async (id: string, value: number[]) => {
    await updateWeight({ id, weight: value[0] })
  }

  const columns = [
    { header: "Model Name", accessor: "name" as const, className: "font-semibold" },
    { header: "Version", accessor: "version" as const, className: "font-mono text-slate-500" },
    { 
      header: "Status", 
      accessor: (item: any) => <StatusBadge status={item.status} /> 
    },
    { 
      header: "Risk Weight", 
      accessor: (item: any) => (
        <div className="flex items-center gap-4 w-[200px]">
          <Slider 
            value={[item.weight]} 
            max={100} 
            step={1} 
            onValueChange={(val) => handleWeightChange(item.id, val)}
            className="flex-1"
          />
          <span className="font-mono text-xs w-8 text-right font-bold text-emerald-400">{item.weight}%</span>
        </div>
      ) 
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">ML Model Controls</h1>
          <p className="text-slate-400 mt-1">Fine-tune the platforms intelligence by adjusting risk signal weights.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Defaults
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
            <Save className="mr-2 h-4 w-4" />
            Apply Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminTable columns={columns} data={models ?? []} />
        </div>

        <Card className="bg-slate-900 border-slate-800 h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Cpu className="size-4 text-emerald-400" />
              Global Sensitivity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300">Minimum Risk Threshold</label>
              <div className="flex gap-4">
                <Input 
                  type="number" 
                  defaultValue={35} 
                  className="bg-slate-950 border-slate-800 text-slate-100" 
                />
                <Button variant="outline" className="border-slate-800 shrink-0">Set</Button>
              </div>
              <p className="text-xs text-slate-500">Events below this score will not trigger any security challenges.</p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="text-sm font-medium text-slate-300">Model Refresh Cycle</label>
              <select className="w-full mt-2 bg-slate-950 border-slate-800 text-slate-300 rounded-md p-2 text-sm">
                <option>Every 6 Hours</option>
                <option>Every 12 Hours</option>
                <option>Daily</option>
                <option>Weekly (Stable)</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
