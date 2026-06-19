"use client"

import Link from "next/link"
import { LogOut, Settings } from "lucide-react"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { userInitials } from "@/lib/user-utils"

interface AppHeaderProps {
  user: { name?: string | null; email?: string | null }
  /** Hide name/email on narrow mobile headers */
  showProfileText?: boolean
}

export function AppHeader({ user, showProfileText = true }: AppHeaderProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <ThemeToggle />

      <div
        className="hidden h-6 w-px bg-border-light sm:block"
        aria-hidden="true"
      />

      {showProfileText && (
        <div className="hidden min-w-0 text-right md:block">
          <p className="truncate text-sm font-medium text-text-primary">
            {user.name ?? "Account"}
          </p>
          <p className="truncate text-xs text-text-muted">{user.email}</p>
        </div>
      )}

      <Avatar size="default">
        <AvatarFallback className="bg-bg-muted text-xs font-semibold text-text-secondary">
          {userInitials(user.name, user.email)}
        </AvatarFallback>
      </Avatar>

      <Link
        href="/settings"
        aria-label="Settings"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-bg-muted hover:text-text-primary"
      >
        <Settings className="h-[18px] w-[18px]" aria-hidden="true" />
      </Link>

      <button
        type="button"
        onClick={() => signOut({ redirectTo: "/" })}
        aria-label="Sign out"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors duration-200 hover:bg-error-bg hover:text-error"
      >
        <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    </div>
  )
}
