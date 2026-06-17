import type { Metadata } from "next"
import Link from "next/link"
import {
  Apple,
  ArrowRight,
  ChefHat,
  HeartPulse,
  Languages,
  Leaf,
  LineChart,
  ShoppingBasket,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { FeaturesFloatingMeals, HeroFloatingMeals } from "@/components/landing/floating-meals"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "AduanePa — AI nutrition & meal plans for Ghana",
  description:
    "Personalised, culturally relevant meal plans and health tracking built for Ghanaian users. Eat well with the foods you know.",
}

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI meal plans",
    body: "Daily plans generated around your goals, calories and health conditions — not generic templates.",
  },
  {
    icon: UtensilsCrossed,
    title: "Ghanaian-first dishes",
    body: "Banku, kontomire, waakye, tilapia and more — local meals you actually want to eat.",
  },
  {
    icon: HeartPulse,
    title: "Health-aware",
    body: "Built-in dietary rules for hypertension, diabetes and weight goals keep every meal safe.",
  },
  {
    icon: ChefHat,
    title: "Make Me a Meal",
    body: "Tell us what's in your kitchen and get a recipe that fits — no shopping trip required.",
  },
  {
    icon: Apple,
    title: "Nutrition tracking",
    body: "See calories and macros at a glance, with trends that show how you're progressing.",
  },
  {
    icon: ShoppingBasket,
    title: "Smart grocery lists",
    body: "Your week's plan turns into one organised, category-grouped shopping list.",
  },
]

const STEPS = [
  {
    title: "Build your profile",
    body: "Share your age, weight, goals and any health conditions in a quick onboarding.",
  },
  {
    title: "Get your plan",
    body: "We generate a personalised, Ghanaian-first meal plan that respects your dietary needs.",
  },
  {
    title: "Track & adapt",
    body: "Log your meals and readings — your recommendations evolve with your progress.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-main text-text-primary">
      {/* ─── Floating nav ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border-light/60 bg-bg-main/80 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-bold">AduanePa</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="bg-primary text-white hover:bg-primary-hover">
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <HeroFloatingMeals />

        {/* decorative blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 z-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-32 z-0 h-72 w-72 rounded-full bg-primary-light/10 blur-3xl"
        />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-light bg-bg-card px-3 py-1 text-xs font-medium text-text-secondary">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              AI nutrition, built for Ghana
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Eat well with the{" "}
              <span className="text-primary">foods you know</span>
            </h1>
            <p className="max-w-md text-base text-text-secondary sm:text-lg">
              AduanePa creates personalised, culturally relevant meal plans and tracks your health —
              so eating right finally fits your life and your kitchen.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-primary text-white hover:bg-primary-hover"
              >
                <Link href="/register">
                  Create free account
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
            <dl className="mt-2 flex gap-8">
              <div>
                <dt className="text-2xl font-bold text-primary">50+</dt>
                <dd className="text-xs text-text-muted">Local foods</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold text-primary">3</dt>
                <dd className="text-xs text-text-muted">Languages</dd>
              </div>
              <div>
                <dt className="text-2xl font-bold text-primary">100%</dt>
                <dd className="text-xs text-text-muted">Personalised</dd>
              </div>
            </dl>
          </div>

          {/* Hero mockup */}
          <div className="relative">
            <div className="rounded-2xl border border-border-light bg-bg-card p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted">Today&apos;s plan</p>
                  <p className="font-display text-lg font-semibold">1,850 kcal</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <ul className="space-y-2.5">
                {[
                  { meal: "Breakfast", name: "Oats with groundnuts & banana", kcal: "420" },
                  { meal: "Lunch", name: "Waakye with grilled tilapia", kcal: "680" },
                  { meal: "Dinner", name: "Kontomire stew with boiled yam", kcal: "560" },
                  { meal: "Snack", name: "Roasted plantain & nuts", kcal: "190" },
                ].map((row) => (
                  <li
                    key={row.meal}
                    className="flex items-center justify-between rounded-lg bg-bg-muted px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-text-muted">{row.meal}</p>
                      <p className="truncate text-sm font-medium">{row.name}</p>
                    </div>
                    <span className="ml-3 shrink-0 text-xs font-semibold text-primary">
                      {row.kcal} kcal
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success-bg px-3 py-2 text-xs font-medium text-success-dark">
                <HeartPulse className="h-4 w-4" aria-hidden="true" />
                Low-sodium · diabetes-friendly
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <FeaturesFloatingMeals />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Everything you need to eat better
          </h2>
          <p className="mt-3 text-text-secondary">
            Thoughtful tools that work with Ghanaian cuisine and your health — not against them.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-border-light bg-bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-lg"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm text-text-secondary">{feature.body}</p>
              </div>
            )
          })}
        </div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-bg-card py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">How it works</h2>
            <p className="mt-3 text-text-secondary">Three steps to a plan that fits your life.</p>
          </div>
          <ol className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative flex flex-col gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-text-secondary">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── Built for Ghana ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Made for the way Ghana eats</h2>
            <p className="text-text-secondary">
              Most nutrition apps assume a Western pantry. AduanePa is grounded in local staples and
              speaks your language, so healthy eating feels familiar — never foreign.
            </p>
            <ul className="space-y-3">
              {[
                { icon: LineChart, text: "Nutrition data for Ghanaian staples, not just imports" },
                { icon: Languages, text: "Available in English, Twi and Ga" },
                { icon: HeartPulse, text: "Condition-aware guidance for hypertension & diabetes" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.text} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-sm text-text-secondary">{item.text}</span>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Banku & tilapia", "Waakye", "Kontomire stew", "Red red & plantain"].map((dish) => (
              <div
                key={dish}
                className="flex items-center gap-2 rounded-2xl border border-border-light bg-bg-card p-4 shadow-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium">{dish}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary-active px-6 py-14 text-center sm:px-12">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Start eating well today
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/85 sm:text-base">
            Create your free account and get your first personalised meal plan in minutes.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-7 bg-white text-primary hover:bg-white/90"
          >
            <Link href="/register">
              Create free account
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border-light">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span className="font-display text-base font-bold">AduanePa</span>
          </div>
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} AduanePa. Nutrition for Ghana.
          </p>
        </div>
      </footer>
    </div>
  )
}
