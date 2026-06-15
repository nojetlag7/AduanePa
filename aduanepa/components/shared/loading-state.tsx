import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-[50vh] flex-col items-center justify-center gap-3 text-text-muted",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
