"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { useState } from "react"

export function ProjectInfoCard() {
    const [showKey, setShowKey] = useState(false)
    const apiKey = "ag_live_51PjU6B2qW9z7XmN"

    const maskKey = (key: string) => {
        return showKey ? key : "••••••••••••••••"
    }

    return (
        <Card className="rounded-xl border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-semibold">Project Information</CardTitle>
                <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-400">
                    Pro Plan
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="grid gap-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Project ID</span>
                            <span className="font-mono text-sm">aegis_prod_main_01</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">API Key</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-sm bg-secondary/50 px-2 py-1 rounded border border-border/50 min-w-[180px]">
                                    {maskKey(apiKey)}
                                </span>
                                <Button variant="ghost" size="icon" className="size-8" onClick={() => setShowKey(!showKey)}>
                                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="size-8">
                                    <Copy className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center items-end gap-2">
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                            <ShieldCheck className="size-4" />
                            System Operational
                        </div>
                        <p className="text-xs text-muted-foreground text-right border-t border-border/50 pt-2">
                            Next billing date: Sept 12, 2026
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
