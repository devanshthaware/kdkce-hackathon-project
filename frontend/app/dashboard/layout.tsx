"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardSidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SecurityPopup } from "@/components/support/SecurityPopup"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && user) {
      const isAdmin = 
        user.publicMetadata?.role === "admin" || 
        user.primaryEmailAddress?.emailAddress === "devanshthaware0@gmail.com"

      if (isAdmin) {
        router.push("/admin")
      }
    }
  }, [isLoaded, user, router])
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="transition-all duration-300 lg:pl-64">
        <Topbar />
        <main className="p-6">{children}</main>
        <SecurityPopup />
      </div>
    </div>
  )
}
