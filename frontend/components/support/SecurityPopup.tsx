"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function SecurityPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();
    const { user } = useUser();

    // Mock checking Risk Policy via convex or direct local storage 
    // In a full implementation, this could subscribe to a 'currentSession' convex query.
    // For now, we simulate a check every 30s or on mount.

    useEffect(() => {
        // Simulate detecting a HIGH risk level (for demo purposes)
        const checkRisk = () => {
            const triggered = localStorage.getItem("aegis_demo_risk_trigger");
            if (triggered === "HIGH" && !sessionStorage.getItem("aegis_dismissed_security_popup")) {
                setIsVisible(true);
            }
        };

        // Initial check
        checkRisk();

        const interval = setInterval(checkRisk, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem("aegis_dismissed_security_popup", "true");
    };

    const handleContactSupport = () => {
        setIsVisible(false);
        sessionStorage.setItem("aegis_dismissed_security_popup", "true");
        router.push("/dashboard/support");
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm animate-in slide-in-from-bottom-5">
            <div className="relative overflow-hidden rounded-xl border border-destructive/50 bg-destructive/10 p-4 shadow-lg backdrop-blur-md">
                <button
                    onClick={handleDismiss}
                    className="absolute right-3 top-3 rounded-md text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                    <X className="size-4" />
                </button>
                <div className="flex gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/20">
                        <ShieldAlert className="size-5 text-destructive" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-semibold leading-none tracking-tight text-destructive">
                            Security Alert Detected
                        </h4>
                        <p className="text-sm text-destructive/80">
                            Our Risk Engine detected anomalous activity in your current session.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="destructive" onClick={handleContactSupport}>
                                Contact Support
                            </Button>
                            <Button size="sm" variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive" onClick={handleDismiss}>
                                Ignore
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
