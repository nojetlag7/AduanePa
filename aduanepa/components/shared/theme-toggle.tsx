"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle dark mode"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-bg-muted hover:text-text-primary",
        className
      )}
    >
      {/* CSS-driven so it stays hydration-safe (the .dark class is set before hydration) */}
      <Moon className="h-[18px] w-[18px] dark:hidden" aria-hidden="true" />
      <Sun className="hidden h-[18px] w-[18px] dark:block" aria-hidden="true" />
    </button>
  )
}
