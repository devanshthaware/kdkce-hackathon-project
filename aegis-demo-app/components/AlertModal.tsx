"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { useRiskContext } from "@/lib/riskContext";

export default function AlertModal() {
    const { risk } = useRiskContext();
    const level = risk?.risk_level ?? "LOW";
    const isOpen = level === "CRITICAL";

    return (
        <Dialog open={isOpen}>
            <DialogContent className="border-red-500 bg-slate-900 text-white max-w-md">
                <DialogHeader className="flex flex-col items-center gap-4 py-4">
                    <div className="size-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 animate-pulse">
                        <ShieldAlert className="text-red-500 size-10" />
                    </div>
                    <div className="text-center space-y-2">
                        <DialogTitle className="text-2xl font-black text-red-500 uppercase tracking-tighter">
                            Session Compromised
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 font-medium">
                            Immediate security escalation triggered. Access to administrative functions has been permanently revoked for this session.
                        </DialogDescription>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
