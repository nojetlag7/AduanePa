"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Apple,
  ChefHat,
  HeartPulse,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShoppingBasket,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"
import { BrandLogo } from "@/components/shared/brand-logo"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const NAV_ROUTES: { href: string; key: string; icon: LucideIcon }[] = [
  { href: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/meals", key: "meals", icon: UtensilsCrossed },
  { href: "/make-me-a-meal", key: "makeMeAMeal", icon: ChefHat },
  { href: "/health", key: "health", icon: HeartPulse },
  { href: "/nutrition", key: "nutrition", icon: Apple },
  { href: "/grocery", key: "grocery", icon: ShoppingBasket },
  { href: "/settings", key: "settings", icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
}

export function Sidebar({ collapsed = false, onToggleCollapse, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const t = useTranslations("nav")

  return (
    <div className="flex h-full flex-col bg-bg-card">
      {/*
        Brand header — h-14 to match the desktop top-bar in app-shell,
        so the single bottom border reads as one continuous horizontal line.
      */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border-light px-3",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2 overflow-hidden"
          aria-label="AduanePa dashboard"
        >
          <BrandLogo className="h-8 w-8 shrink-0 text-primary" />
          {!collapsed && (
            <span className="font-display text-base font-bold text-text-primary">AduanePa</span>
          )}
        </Link>

        {/* Collapse button — only visible when expanded */}
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

      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Main navigation">
          {/*
            Expand button lives as the FIRST nav row when collapsed,
            aligned flush with the icon-only nav items below it.
          */}
          {onToggleCollapse && collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Expand sidebar"
                  className="mb-1 hidden w-full items-center justify-center rounded-lg px-2 py-2.5 text-text-muted transition-colors duration-200 hover:bg-bg-muted hover:text-text-primary lg:flex"
                >
                  <PanelLeftOpen className="h-5 w-5 shrink-0" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          )}

          {NAV_ROUTES.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            const label = t(item.key as Parameters<typeof t>[0])

            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                aria-label={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-bg-muted text-text-primary"
                    : "text-text-secondary hover:bg-bg-muted/60 hover:text-text-primary"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
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
