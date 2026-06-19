"use client"

import Link from "next/link"
import { LogOut, Settings } from "lucide-react"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { userInitials } from "@/lib/user-utils"

interface AppHeaderProps {
  user: { name?: string | null; email?: string | null }
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open account menu"
          className="rounded-full outline-none ring-offset-2 ring-offset-bg-card transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar size="default">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {userInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8} className="w-60">
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1">
            <span className="truncate text-sm font-medium text-text-primary">
              {user.name ?? "Account"}
            </span>
            {user.email && (
              <span className="truncate text-xs font-normal text-text-muted">
                {user.email}
              </span>
            )}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault()
              void signOut({ redirectTo: "/" })
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
