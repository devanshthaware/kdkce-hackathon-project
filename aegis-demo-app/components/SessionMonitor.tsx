"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function SessionMonitor() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="size-4" />
                    Session Monitor
                </CardTitle>
                <CardDescription>Continuous behavioral analysis</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Monitoring active session telemetry...</p>
            </CardContent>
        </Card>
    );
}
