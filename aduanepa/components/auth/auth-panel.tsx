"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginSchema, registerSchema } from "@/lib/validations/auth"
import { cn } from "@/lib/utils"

type Mode = "signin" | "signup"

const COPY: Record<Mode, { heading: string; helper: string }> = {
  signin: {
    heading: "Welcome back",
    helper: "Sign in to continue to your meal plans.",
  },
  signup: {
    heading: "Create your account",
    helper: "Start eating well with meals built around you.",
  },
}

// Advisory rules surfaced in the strength meter. Submission itself is gated by
// `registerSchema` (min 8 chars) so the server contract stays unchanged.
const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Upper & lowercase letters", test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "At least one number", test: (p) => /\d/.test(p) },
]

const STRENGTH_META = [
  { label: "Too short", bar: "bg-error", text: "text-error" },
  { label: "Weak", bar: "bg-error", text: "text-error" },
  { label: "Fair", bar: "bg-warning", text: "text-warning" },
  { label: "Strong", bar: "bg-success", text: "text-success" },
] as const

export function AuthPanel({ initialMode = "signin" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode)

  return (
    <Card className="rounded-2xl border-border-light/70 p-6 shadow-sm sm:p-7 dark:border-white/6">
      {/* Segmented control with sliding highlight */}
      <div
        role="tablist"
        aria-label="Authentication mode"
        className="relative grid grid-cols-2 rounded-full bg-bg-muted p-1"
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none",
            mode === "signup" ? "translate-x-full" : "translate-x-0"
          )}
        />
        {(["signin", "signup"] as const).map((value) => {
          const active = mode === value
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(value)}
              className={cn(
                "relative z-10 rounded-full py-2 text-sm font-semibold transition-colors duration-200",
                active ? "text-white" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {value === "signin" ? "Sign in" : "Sign up"}
            </button>
          )
        })}
      </div>

      {/* Heading + helper text */}
      <div className="mt-6 space-y-1">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {COPY[mode].heading}
        </h1>
        <p className="text-sm text-text-secondary">{COPY[mode].helper}</p>
      </div>

      {/* Active form, faded in on switch */}
      <div key={mode} className="mt-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
        {mode === "signin" ? (
          <SignInForm />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setMode("signin")} />
        )}
      </div>
    </Card>
  )
}

/* ─── Sign in ─────────────────────────────────────────────────────────────── */

function SignInForm() {
  const router = useRouter()
  const [values, setValues] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<Partial<Record<"email" | "password", string>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function update(field: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const parsed = loginSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      setErrors({ email: fieldErrors.email?.[0], password: fieldErrors.password?.[0] })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
        setErrors({ password: "Invalid email or password" })
        return
      }

      // Proxy decides the final destination (verify-email / onboarding /
      // dashboard) based on the user's state.
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Email" htmlFor="signin-email" error={errors.email}>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          aria-invalid={!!errors.email}
        />
      </Field>

      <Field label="Password" htmlFor="signin-password" error={errors.password}>
        <PasswordInput
          id="signin-password"
          autoComplete="current-password"
          value={values.password}
          onChange={(value) => update("password", value)}
          show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
          invalid={!!errors.password}
        />
      </Field>

      <SubmitButton isSubmitting={isSubmitting} label="Sign in" />
    </form>
  )
}

/* ─── Sign up ─────────────────────────────────────────────────────────────── */

function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const router = useRouter()
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<
    Partial<Record<"name" | "email" | "password" | "confirmPassword", string>>
  >({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passedRules = useMemo(
    () => PASSWORD_RULES.map((rule) => rule.test(values.password)),
    [values.password]
  )
  const strengthScore = passedRules.filter(Boolean).length

  function update(field: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const parsed = registerSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: data.error })
        } else if (data.fields) {
          setErrors({
            name: data.fields.name?.[0],
            email: data.fields.email?.[0],
            password: data.fields.password?.[0],
            confirmPassword: data.fields.confirmPassword?.[0],
          })
        } else {
          toast.error(data.error ?? "Something went wrong. Please try again.")
        }
        return
      }

      if (data.emailSent === false) {
        toast.warning("Account created, but we couldn't send the code. Try resending it.")
      } else {
        toast.success("Account created. Check your email for a verification code.")
      }

      // Establish a session so the verification page (and its resend action)
      // are available, then move the user to email verification.
      const signInResult = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast.error("Account created. Please sign in to continue.")
        onSwitchToSignIn()
        return
      }

      router.push("/verify-email")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Full name" htmlFor="signup-name" error={errors.name}>
        <Input
          id="signup-name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          aria-invalid={!!errors.name}
        />
      </Field>

      <Field label="Email" htmlFor="signup-email" error={errors.email}>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          aria-invalid={!!errors.email}
        />
      </Field>

      <Field label="Password" htmlFor="signup-password" error={errors.password}>
        <PasswordInput
          id="signup-password"
          autoComplete="new-password"
          value={values.password}
          onChange={(value) => update("password", value)}
          show={showPassword}
          onToggleShow={() => setShowPassword((v) => !v)}
          invalid={!!errors.password}
        />
        {values.password.length > 0 && (
          <PasswordStrength score={strengthScore} passedRules={passedRules} />
        )}
      </Field>

      <Field label="Confirm password" htmlFor="signup-confirm" error={errors.confirmPassword}>
        <Input
          id="signup-confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          aria-invalid={!!errors.confirmPassword}
        />
      </Field>

      <SubmitButton isSubmitting={isSubmitting} label="Create account" />
    </form>
  )
}

/* ─── Shared building blocks ──────────────────────────────────────────────── */

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}

function PasswordInput({
  id,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
  invalid,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  show: boolean
  onToggleShow: () => void
  autoComplete: string
  invalid: boolean
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className="pr-10"
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors duration-200 hover:text-text-secondary"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function PasswordStrength({
  score,
  passedRules,
}: {
  score: number
  passedRules: boolean[]
}) {
  const meta = STRENGTH_META[score]
  return (
    <div className="mt-1 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex h-1.5 flex-1 gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "flex-1 rounded-full transition-colors duration-200",
                i < score ? meta.bar : "bg-border-medium"
              )}
            />
          ))}
        </div>
        <span className={cn("text-xs font-medium", meta.text)}>{meta.label}</span>
      </div>
      <ul className="space-y-1">
        {PASSWORD_RULES.map((rule, i) => {
          const ok = passedRules[i]
          return (
            <li
              key={rule.label}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors duration-200",
                ok ? "text-success" : "text-text-muted"
              )}
            >
              {ok ? (
                <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              )}
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SubmitButton({ isSubmitting, label }: { isSubmitting: boolean; label: string }) {
  return (
    <Button
      type="submit"
      size="lg"
      disabled={isSubmitting}
      className="mt-2 bg-primary text-white hover:bg-primary-hover"
    >
      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {label}
    </Button>
  )
}
