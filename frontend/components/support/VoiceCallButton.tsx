"use client";

import { useState } from "react";
import { Phone, PhoneCall, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export function VoiceCallButton() {
    const { user } = useUser();
    const [isCalling, setIsCalling] = useState(false);
    const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active">("idle");

    const [phoneNumber, setPhoneNumber] = useState(user?.primaryPhoneNumber?.phoneNumber || "");

    const initiateCall = async () => {
        if (!user || !phoneNumber) {
            toast.error("Please enter a valid phone number.");
            return;
        }
        setIsCalling(true);
        setCallStatus("connecting");

        try {
            const response = await fetch("http://localhost:8000/api/v1/support/call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    phone_number: phoneNumber,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to initiate call");
            }

            setCallStatus("active");
            toast.success("Call Initiated. Please pick up your phone.");

            setTimeout(() => {
                setCallStatus("idle");
                setIsCalling(false);
            }, 5000); // Mock active state reset

        } catch (error) {
            console.error(error);
            toast.error("Failed to connect to Voice Support.");
            setCallStatus("idle");
            setIsCalling(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full sm:w-auto">
            <input
                type="tel"
                placeholder="Enter phone number (e.g. +1234567890)"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isCalling}
            />
            <Button
                onClick={initiateCall}
                disabled={isCalling || !phoneNumber}
                variant={callStatus === "active" ? "secondary" : "default"}
                size="lg"
                className="w-full"
            >
                {callStatus === "connecting" ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                ) : callStatus === "active" ? (
                    <PhoneCall className="mr-2 size-4 animate-pulse text-green-500" />
                ) : (
                    <Phone className="mr-2 size-4" />
                )}
                {callStatus === "connecting" ? "Connecting..." : callStatus === "active" ? "Call in Progress" : "Call Support (Voice)"}
            </Button>
        </div>
    );
}
