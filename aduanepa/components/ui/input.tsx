import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-border-light bg-bg-main px-3 py-2 text-base text-text-primary shadow-none transition-[border-color,box-shadow,background-color] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-text-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-border-light dark:bg-bg-muted/60",
        "hover:border-border-medium",
        "focus-visible:border-primary focus-visible:bg-bg-card focus-visible:ring-2 focus-visible:ring-primary/20",
        "aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
