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
          className="rounded-full outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-main dark:focus-visible:ring-offset-[#080808] data-[state=open]:ring-2 data-[state=open]:ring-primary/50 data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-bg-main dark:data-[state=open]:ring-offset-[#080808]"
        >
          <Avatar size="default">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {userInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={10} className="w-64">
          <DropdownMenuLabel className="flex flex-col gap-1 px-2 py-2 font-normal">
            <span className="truncate text-sm font-semibold text-text-primary">
              {user.name ?? "Account"}
            </span>
            {user.email && (
              <span className="truncate text-xs text-text-muted">{user.email}</span>
            )}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/settings" className="w-full">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
          </DropdownMenuItem>

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
