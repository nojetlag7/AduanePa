"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Apple,
  ChefHat,
  HeartPulse,
  LayoutDashboard,
  Leaf,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingBasket,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meals", label: "My Meals", icon: UtensilsCrossed },
  { href: "/make-me-a-meal", label: "Make Me a Meal", icon: ChefHat },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
  { href: "/grocery", label: "Grocery List", icon: ShoppingBasket },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
}

export function Sidebar({ collapsed = false, onToggleCollapse, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-bg-card">
      {/* Brand + collapse toggle */}
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border-light px-4",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2 overflow-hidden"
          aria-label="AduanePa dashboard"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-text-primary">AduanePa</span>
          )}
        </Link>
        {onToggleCollapse && !collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors duration-200 hover:bg-bg-muted hover:text-text-primary lg:inline-flex"
          >
            <PanelLeftClose className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        )}
      </div>

      {onToggleCollapse && collapsed && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Expand sidebar"
          className="mx-auto mt-2 hidden h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors duration-200 hover:bg-bg-muted hover:text-text-primary lg:inline-flex"
        >
          <PanelLeftOpen className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      )}

      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-bg-muted text-text-primary"
                    : "text-text-secondary hover:bg-bg-muted/60 hover:text-text-primary"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }
            return link
          })}
        </nav>
      </TooltipProvider>
    </div>
  )
}
