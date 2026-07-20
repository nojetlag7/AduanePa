"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type DangerZoneProps = {
  userEmail: string
  hasPassword: boolean
}

export function DangerZone({ userEmail, hasPassword }: DangerZoneProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const canDelete = hasPassword ? !!password : !!confirmEmail

  async function handleDelete() {
    if (hasPassword && !password) {
      setError("Password is required")
      return
    }
    if (!hasPassword && !confirmEmail) {
      setError("Enter your email to confirm")
      return
    }

    setError(null)
    setDeleting(true)

    try {
      const res = await fetch("/api/users/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          hasPassword ? { password } : { confirmEmail: confirmEmail.trim().toLowerCase() }
        ),
      })
      const json = await res.json()
      if (!res.ok) {
        const msg =
          json.fields?.password?.[0] ??
          json.fields?.confirmEmail?.[0] ??
          json.error ??
          "Failed to delete account"
        setError(msg)
        return
      }
      toast.success("Account deleted")
      await signOut({ redirect: false })
      router.push("/")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-xl border border-error/30 bg-error/5 p-4">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-error" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-error">Delete account</p>
          <p className="mt-0.5 text-xs text-text-muted">
            Permanently deletes your account and all associated data. This cannot be undone.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="destructive"
          onClick={() => {
            setPassword("")
            setConfirmEmail("")
            setError(null)
            setOpen(true)
          }}
        >
          Delete my account
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all your data — meal plans, health
              logs, and saved meals.{" "}
              {hasPassword
                ? "Enter your password to confirm."
                : `Type your email (${userEmail}) to confirm.`}
            </DialogDescription>
          </DialogHeader>

          {hasPassword ? (
            <div className="space-y-1.5">
              <Label htmlFor="delete-password">Password</Label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="delete-confirm-email">Email</Label>
              <Input
                id="delete-confirm-email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                autoComplete="email"
                placeholder={userEmail}
              />
            </div>
          )}
          {error && <p className="text-xs text-error">{error}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting || !canDelete}>
              {deleting ? "Deleting…" : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
