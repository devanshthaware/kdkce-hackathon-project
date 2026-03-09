import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SecurityPopup } from "@/components/support/SecurityPopup"
import { SeedWrapper } from "@/components/dashboard/seed-wrapper"
import { OrganizationProvider } from "@/components/providers/organization-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await currentUser()
  
  if (user) {
    const isAdmin = 
      user.publicMetadata?.role === "admin" || 
      user.emailAddresses?.[0]?.emailAddress === "devanshthaware0@gmail.com"

    if (isAdmin) {
      redirect("/admin")
    }
  }

  return (
    <OrganizationProvider>
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <div className="transition-all duration-300 lg:pl-64">
          <Topbar />
          <main className="p-6">{children}</main>
          <SecurityPopup />
          <SeedWrapper />
        </div>
      </div>
    </OrganizationProvider>
  )
}
