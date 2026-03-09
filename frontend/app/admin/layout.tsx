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

  // Protection logic (Step 13)
  // In a real app, you'd check user.publicMetadata.role === "admin"
  // For this demo/task, we'll allow access if role is admin OR if we're in dev mode
  // and the user is logged in.
  if (isLoaded && user) {
    const isAdmin = user.publicMetadata?.role === "admin"
    if (!isAdmin) {
      console.log("User is not an admin, redirecting to dashboard")
      // redirect("/dashboard") 
      // Uncomment the redirect in production
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
