"use client"

import Link from "next/link"
import { useEffect, useState, type MouseEvent } from "react"
import { Menu } from "lucide-react"
import { useTranslations } from "next-intl"
import { BrandLogo } from "@/components/shared/brand-logo"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const NAV_HREFS = [
  { href: "#top", key: "home" as const },
  { href: "#mission", key: "mission" as const },
  { href: "#contact", key: "contact" as const },
] as const

function smoothScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
}

function scrollToSection(hash: string) {
  const id = hash.replace(/^#/, "")
  const behavior = smoothScrollBehavior()

  if (id === "top") {
    window.scrollTo({ top: 0, behavior })
    history.pushState(null, "", "/")
    return
  }

  const target = document.getElementById(id)
  if (!target) return

  target.scrollIntoView({ behavior, block: "start" })
  history.pushState(null, "", `#${id}`)
}

function NavLink({
  href,
  label,
  className,
  onNavigate,
}: {
  href: string
  label: string
  className?: string
  onNavigate?: () => void
}) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    scrollToSection(href)
    onNavigate?.()
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(
        "text-sm font-medium text-text-secondary transition-colors hover:text-primary",
        className
      )}
    >
      {label}
    </a>
  )
}

export function LandingNav() {
  const t = useTranslations("landing.nav")
  const tc = useTranslations("common")
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname !== "/") return
    event.preventDefault()
    scrollToSection("#top")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border-light/60 bg-bg-main/90 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav
        className="relative flex h-16 w-full items-center px-4 sm:px-6 lg:px-10"
        aria-label="Main"
      >
        <Link
          href="/#top"
          onClick={handleLogoClick}
          className="relative z-10 flex shrink-0 items-center gap-2 transition-opacity duration-200 hover:opacity-90"
        >
          <BrandLogo className="h-9 w-9 text-primary" />
          <span className="font-display text-xl font-bold text-text-primary">AduanePa</span>
        </Link>

        <ul className="pointer-events-none absolute inset-x-0 hidden items-center justify-center gap-8 md:flex">
          {NAV_HREFS.map((link) => (
            <li key={link.href} className="pointer-events-auto">
              <NavLink href={link.href} label={t(link.key)} />
            </li>
          ))}
        </ul>

        <div className="relative z-10 ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={tc("openMenu")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
              <SheetHeader>
                <SheetTitle className="font-display text-left">{tc("menu")}</SheetTitle>
              </SheetHeader>
              <ul className="mt-6 flex flex-col gap-4">
                {NAV_HREFS.map((link) => (
                  <li key={link.href}>
                    <NavLink
                      href={link.href}
                      label={t(link.key)}
                      className="text-base"
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </li>
                ))}
                <li className="border-t border-border-light pt-4">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-text-secondary hover:text-primary"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t("signIn")}
                  </Link>
                </li>
              </ul>
            </SheetContent>
          </Sheet>

          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex hover:bg-primary/10 hover:text-primary">
            <Link href="/login">{t("signIn")}</Link>
          </Button>
          <Button
            asChild
            className="bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md"
          >
            <Link href="/register">{t("getStarted")}</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
