"use client"

import { Moon, Monitor, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">Choose how AduanePa looks for you.</p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {THEMES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 transition-colors duration-200",
              theme === value
                ? "border-primary bg-primary/5 text-primary"
                : "border-border-light text-text-secondary hover:bg-bg-muted hover:text-text-primary"
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
