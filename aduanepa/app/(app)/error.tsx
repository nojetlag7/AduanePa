"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-error-bg text-error">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold text-text-primary">Something went wrong</h2>
        <p className="max-w-sm text-sm text-text-secondary">
          We hit a snag loading this page. Please try again.
        </p>
      </div>
      <Button onClick={reset} className="bg-primary text-white hover:bg-primary-hover">
        Try again
      </Button>
    </div>
  )
}
