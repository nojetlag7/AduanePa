"use client"

import { useState } from "react"
import { ArrowRight, Loader2, Replace } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SubstituteResponse {
  substitute?: string
  reason?: string
  error?: string
}

export function SubstituteIngredient({
  mealId,
  ingredientName,
}: {
  mealId: string
  ingredientName: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ substitute: string; reason: string } | null>(null)

  async function fetchSubstitute() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/meals/substitute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId, ingredientName }),
      })
      const data = (await res.json()) as SubstituteResponse
      if (!res.ok || !data.substitute) {
        toast.error(data.error ?? "Could not find a substitute")
        return
      }
      setResult({ substitute: data.substitute, reason: data.reason ?? "" })
    } catch {
      toast.error("Network error — try again")
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next && !result && !loading) void fetchSubstitute()
    if (!next) setResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-text-muted hover:text-primary"
          aria-label={`Find a substitute for ${ingredientName}`}
        >
          <Replace className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Substitute ingredient</DialogTitle>
          <DialogDescription>
            A dietary-friendly alternative for{" "}
            <span className="font-medium text-text-primary">{ingredientName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[88px] py-2">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Finding a suitable swap…
            </div>
          )}

          {!loading && result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                <span className="text-text-muted line-through">{ingredientName}</span>
                <ArrowRight className="h-4 w-4 text-text-muted" aria-hidden="true" />
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                  {result.substitute}
                </span>
              </div>
              {result.reason && (
                <p className="text-sm text-text-secondary">{result.reason}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={fetchSubstitute}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Replace className="h-4 w-4" aria-hidden="true" />
            )}
            Suggest another
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
