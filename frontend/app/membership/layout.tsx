"use client"

import { Topbar } from "@/components/layout/topbar"

export default function MembershipLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <div className="transition-all duration-300">
                <Topbar />
                <main className="max-w-[1600px] mx-auto p-6">{children}</main>
            </div>
        </div>
    )
}
