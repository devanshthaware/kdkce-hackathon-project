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
  LayoutDashboard,
  AppWindow,
  ShieldAlert,
  Radio,
  BarChart3,
  Settings,
  User,
  LogOut,
  X,
} from "lucide-react"

import { UserButton } from "@clerk/nextjs"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/applications", label: "Applications", icon: AppWindow },
  { href: "/dashboard/risk-policies", label: "Risk Policies", icon: ShieldAlert },
  { href: "/dashboard/sessions", label: "Live Sessions", icon: Radio },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Topbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const notifications = [
    { id: 1, text: "High risk session detected from Moscow, RU", time: "2m ago", unread: true },
    { id: 2, text: "API key ak_dev_* was revoked", time: "15m ago", unread: true },
    { id: 3, text: "New application registered: Partner API", time: "1h ago", unread: false },
    { id: 4, text: "Risk policy threshold updated for Finance model", time: "3h ago", unread: false },
  ]

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-lg">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-5" />
              <span className="sr-only">Open mobile menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar p-0 border-sidebar-border">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
              <Shield className="size-6 text-primary" />
              <span className="text-lg font-bold text-sidebar-foreground">AegisAuth</span>
            </div>
            <nav className="px-3 py-4" aria-label="Mobile navigation">
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <Shield className="size-5 text-primary" />
          <span className="text-xl font-bold tracking-tight">AegisAuth</span>
        </Link>

        {/* Search */}
        <div className="hidden flex-1 lg:block">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sessions, users, policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell className="size-4" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-popover p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-sm font-medium">Notifications</span>
                <span className="text-xs text-muted-foreground">2 unread</span>
              </div>
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 px-4 py-3"
                >
                  <div className="flex items-start gap-2">
                    {notification.unread && (
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    <span className={cn("text-sm", !notification.unread && "ml-3.5 text-muted-foreground")}>
                      {notification.text}
                    </span>
                  </div>
                  <span className="ml-3.5 text-xs text-muted-foreground">
                    {notification.time}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/sessions" className="w-full justify-center py-2.5 text-xs text-primary cursor-pointer">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AnimatedThemeToggler />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
    </>
  )
}
