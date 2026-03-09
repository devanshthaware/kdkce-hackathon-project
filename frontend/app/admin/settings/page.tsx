"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Save, Shield, Clock, Zap, Bell } from "lucide-react"

export default function AdminSettings() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Platform Settings</h1>
        <p className="text-slate-400 mt-1">Global configuration and administrative controls.</p>
      </div>

      <div className="grid gap-6">
        {/* Security Thresholds */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-emerald-400" />
              Security Thresholds
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">Configure how the system reacts to risk scores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-slate-300">Default Block Threshold</Label>
                <span className="font-mono text-emerald-400 font-bold">85</span>
              </div>
              <Slider defaultValue={[85]} max={100} step={1} className="py-2" />
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Any session above this score is automatically blocked.</p>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <Label className="text-slate-300">MFA Challenge Threshold</Label>
                <span className="font-mono text-yellow-400 font-bold">60</span>
              </div>
              <Slider defaultValue={[60]} max={100} step={1} className="py-2" />
            </div>
          </CardContent>
        </Card>

        {/* Monitoring Interval */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-emerald-400" />
              Monitoring Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Session Check Interval (sec)</Label>
                <Input type="number" defaultValue={30} className="bg-slate-950 border-slate-800 text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Token Expiry (minutes)</Label>
                <Input type="number" defaultValue={60} className="bg-slate-950 border-slate-800 text-slate-100" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Continuous Monitoring</Label>
                <p className="text-xs text-slate-500">Enable real-time telemetry for all active sessions.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* API & Rate Limits */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-emerald-400" />
              API & Rate Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Global Rate Limit (req/min)</Label>
              <Input type="number" defaultValue={10000} className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div className="space-y-2 pt-2">
              <Label className="text-slate-300">Burst Allowances</Label>
              <select className="w-full bg-slate-950 border-slate-800 text-slate-300 rounded-md p-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500/20">
                <option>Conservative (5%)</option>
                <option>Standard (10%)</option>
                <option>Aggressive (25%)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-emerald-400" />
              Alert Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Critical Threat Email Webhooks</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Slack Integration</Label>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="ghost" className="text-slate-400 hover:text-slate-100 hover:bg-slate-800">Discard</Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8">
            <Save className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  )
}
