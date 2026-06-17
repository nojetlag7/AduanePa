"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 30

export function VerifyEmailForm() {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  function setDigit(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = char
      return next
    })
    setError(null)
    if (char && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handlePaste(event: React.ClipboardEvent) {
    event.preventDefault()
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH)
    if (!pasted) return
    const next = Array(CODE_LENGTH).fill("")
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    setError(null)
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus()
  }

  async function submitCode(code: string) {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Verification failed. Please try again.")
        return
      }

      toast.success("Email verified")
      // Full navigation so the refreshed session cookie from the API is picked up
      // before middleware runs (client-side router.push can race a stale JWT).
      window.location.href = "/onboarding"
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const code = digits.join("")
    if (code.length !== CODE_LENGTH) {
      setError("Enter the 6-digit code")
      return
    }
    void submitCode(code)
  }

  async function handleResend() {
    setIsResending(true)
    try {
      const res = await fetch("/api/auth/resend-otp", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Could not resend the code.")
        return
      }
      toast.success("A new code is on its way.")
      setDigits(Array(CODE_LENGTH).fill(""))
      setCooldown(RESEND_COOLDOWN_SECONDS)
      inputsRef.current[0]?.focus()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            value={digit}
            onChange={(e) => setDigit(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            aria-label={`Digit ${index + 1}`}
            className={cn(
              "h-12 w-11 rounded-lg border bg-bg-main text-center text-xl font-semibold text-text-primary transition-[border-color,box-shadow,background-color] outline-none dark:bg-bg-muted/60",
              "hover:border-border-medium",
              "focus:border-primary focus:bg-bg-card focus:ring-2 focus:ring-primary/20",
              error ? "border-error ring-2 ring-error/20" : "border-border-light"
            )}
          />
        ))}
      </div>

      {error && <p className="text-center text-xs text-error">{error}</p>}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="bg-primary text-white hover:bg-primary-hover"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Verify email
      </Button>

      <div className="text-center text-sm text-text-secondary">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-text-muted disabled:no-underline"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  )
}
