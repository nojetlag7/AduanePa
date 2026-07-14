"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { ForegroundListener } from "@/components/notifications/foreground-listener"
import { AppHeader } from "@/components/shared/app-header"
import { BrandLogo } from "@/components/shared/brand-logo"
import { Sidebar } from "@/components/shared/sidebar"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const COLLAPSE_KEY = "aduanepa:sidebar-collapsed"

const collapseListeners = new Set<() => void>()
let collapseCache: boolean | null = null

function getCollapsed(): boolean {
  if (collapseCache === null) {
    collapseCache =
      typeof window !== "undefined" && window.localStorage.getItem(COLLAPSE_KEY) === "true"
  }
  return collapseCache
}

function setCollapsed(value: boolean) {
  collapseCache = value
  if (typeof window !== "undefined") {
    window.localStorage.setItem(COLLAPSE_KEY, String(value))
  }
  collapseListeners.forEach((listener) => listener())
}

function subscribeCollapsed(listener: () => void) {
  collapseListeners.add(listener)
  return () => collapseListeners.delete(listener)
}

interface AppShellProps {
  user: { name?: string | null; email?: string | null }
  children: React.ReactNode
}

export function AppShell({ user, children }: AppShellProps) {
  const collapsed = useSyncExternalStore(subscribeCollapsed, getCollapsed, () => false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function toggleCollapse() {
    setCollapsed(!collapsed)
  }

  return (
    <div className="min-h-screen bg-bg-main dark:bg-transparent">
      <ForegroundListener />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-border-light transition-[width] duration-200 lg:block",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border-light bg-bg-card px-4 lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            aria-label="Open navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-bg-muted hover:text-text-primary"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
          <BrandLogo className="h-8 w-8 shrink-0 text-primary" />
          <span className="truncate font-display text-base font-bold text-text-primary">
            AduanePa
          </span>
        </Link>
        <div className="ml-auto">
          <AppHeader user={user} />
        </div>
      </header>

      <main
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-[76px]" : "lg:pl-64"
        )}
      >
        {/* Desktop top bar — profile + theme */}
        <header className="sticky top-0 z-30 hidden h-14 shrink-0 items-center justify-end border-b border-border-light bg-bg-card/95 px-6 backdrop-blur-sm lg:flex lg:px-8">
          <AppHeader user={user} />
        </header>

        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
