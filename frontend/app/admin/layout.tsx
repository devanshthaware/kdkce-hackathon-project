"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded, user } = useUser()

  if (isLoaded && user) {
    const isAdmin = 
      user.publicMetadata?.role === "admin" || 
      user.primaryEmailAddress?.emailAddress === "devanshthaware0@gmail.com";

    if (!isAdmin) {
      console.log("User is not an admin, redirecting to dashboard")
      redirect("/dashboard") 
    }
  } else if (isLoaded && !user) {
    redirect("/auth")
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-950 text-slate-50">
        <AdminSidebar />
        <SidebarInset className="flex flex-col bg-slate-950">
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
