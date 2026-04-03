"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Search,
  Bell,
  Shield,
  Menu,
  AppWindow,
  ShieldAlert,
  Radio,
  Settings,
  X,
  Building2,
  PlusCircle,
  ChevronDown,
  CreditCard,
  FileText,
} from "lucide-react"

import { UserButton } from "@clerk/nextjs"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { useOrganization } from "@/components/providers/organization-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

const navItems = [
  { href: "/dashboard/applications", label: "Applications", icon: AppWindow },
  { href: "/dashboard/risk-policies", label: "Risk Policies", icon: ShieldAlert },
  { href: "/membership", label: "Membership", icon: CreditCard },
  { href: "/docs", label: "Documentation", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/support", label: "Support Center", icon: Radio },
]

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const createOrganization = useMutation(api.organizations.create)
  
  const pathname = usePathname()
  const router = useRouter()

  const notifications = [
    { id: 1, text: "High risk session detected from Moscow, RU", time: "2m ago", unread: true },
    { id: 2, text: "API key ak_dev_* was revoked", time: "15m ago", unread: true },
    { id: 3, text: "New application registered: Partner API", time: "1h ago", unread: false },
    { id: 4, text: "Risk policy threshold updated for Finance model", time: "3h ago", unread: false },
  ]

  const { activeOrganization, setActiveOrganization, organizations } = useOrganization()
  const activeOrgData = organizations?.find(org => org._id === activeOrganization)

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background px-6 backdrop-blur-lg">
        {/* Logo & Desktop Nav Wrapper */}
        <div className="flex items-center gap-8 flex-1">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="size-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">AegisAuth</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                    isActive
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Search (Moved to center-ish part of the nav area) */}
          <div className="hidden xl:block flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-secondary/30 pl-9 pr-4 text-sm text-foreground focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Org Switcher */}
          <div className="hidden sm:flex items-center mr-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-secondary/50">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium hidden md:block">
                    {activeOrgData ? activeOrgData.name : "..."}
                  </span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {organizations?.map((org: any) => (
                  <DropdownMenuItem
                    key={org._id}
                    onClick={() => setActiveOrganization(org._id)}
                    className={cn(
                      "cursor-pointer",
                      activeOrganization === org._id && "bg-secondary font-medium"
                    )}
                  >
                    <Building2 className="mr-2 size-4 text-muted-foreground" />
                    {org.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsCreateModalOpen(true)} className="cursor-pointer text-muted-foreground text-xs">
                  <PlusCircle className="mr-2 size-4" />
                  New Organization
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full bg-background p-0 border-b">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                <Shield className="size-6 text-primary" />
                <span className="text-lg font-bold">AegisAuth</span>
              </div>
              <nav className="px-6 py-6" aria-label="Mobile navigation">
                <ul className="grid grid-cols-2 gap-3">
                  {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl p-4 text-sm font-medium transition-all shadow-sm border border-border/50",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50"
                          )}
                        >
                          <item.icon className={cn("size-5", isActive ? "text-primary-foreground" : "text-primary")} />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell className="size-4" />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover p-0 shadow-xl border-border/50">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-semibold">Activity Stream</span>
                <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Alerts</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 px-4 py-3 border-b border-border/10 last:border-0"
                  >
                    <div className="flex items-start gap-2">
                      {notification.unread && (
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      <span className={cn("text-xs leading-relaxed", !notification.unread && "ml-3.5 text-muted-foreground")}>
                        {notification.text}
                      </span>
                    </div>
                    <span className="ml-3.5 text-[10px] font-medium text-muted-foreground/60">
                      {notification.time}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuItem className="justify-center py-3 text-xs font-bold text-primary hover:bg-primary/5 cursor-pointer rounded-t-none">
                View Intelligence Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
          
          <AnimatedThemeToggler />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-background border-border sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">New Organization</DialogTitle>
            <DialogDescription>
              Deploy a new isolated workspace for team collaboration.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="orgName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</Label>
              <Input
                id="orgName"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="e.g. Aegis Security"
                className="bg-secondary/30 border-border/50 h-11 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8"
              disabled={!newOrgName.trim()}
              onClick={async () => {
                if (!newOrgName.trim()) return;
                try {
                  const newOrgId = await createOrganization({ name: newOrgName });
                  setActiveOrganization(newOrgId as any);
                  setIsCreateModalOpen(false);
                  setNewOrgName("");
                } catch (error) {
                  console.error("Failed to create organization:", error);
                }
              }}
            >
              Initialize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
