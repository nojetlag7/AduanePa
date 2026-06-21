import { Activity, HeartPulse, UtensilsCrossed, Users } from "lucide-react"

const CHALLENGES = [
  {
    icon: HeartPulse,
    title: "Rising non-communicable diseases",
    body: "Hypertension, diabetes and obesity are among the leading health burdens in Ghana — often linked to diet, sodium intake and limited personalised guidance.",
  },
  {
    icon: UtensilsCrossed,
    title: "Advice that ignores local food",
    body: "Most nutrition tools recommend meals and ingredients that are unfamiliar or expensive here. People are told to eat \"healthy\" without a plan built around banku, kontomire, or waakye.",
  },
  {
    icon: Users,
    title: "Hard to sustain good habits",
    body: "Without plans that fit culture, budget and health conditions, eating well becomes a short burst of effort — not a lasting change in livelihood and wellbeing.",
  },
]

const RESPONSES = [
  "Personalised meal plans rooted in Ghanaian staples and everyday kitchens",
  "Diet rules for hypertension, diabetes and weight goals built into every suggestion",
  "Health tracking and grocery lists so good nutrition becomes practical, not theoretical",
]

export function MissionSection() {
  return (
    <section
      id="mission"
      className="scroll-mt-20 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            Our mission
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
            Better health should fit how Ghana actually eats
          </h2>
          <p className="mt-4 text-base text-text-secondary sm:text-lg">
            AduanePa exists because preventable diet-related illness is growing — yet the tools
            available rarely speak to our foods, languages, or daily realities. We want to improve
            livelihoods by making culturally grounded nutrition guidance accessible to everyone.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {CHALLENGES.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-border-light bg-bg-main p-6 transition-all duration-200 hover:border-primary/25 hover:shadow-card-hover dark:bg-bg-muted/30"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.body}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <h3 className="font-display text-xl font-semibold text-text-primary">
            How AduanePa helps
          </h3>
          <ul className="mt-4 space-y-3">
            {RESPONSES.map((line) => (
              <li key={line} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-text-muted">
            We are not a replacement for medical care — but we believe everyday meals, planned with
            care, are one of the most powerful levers for a healthier, more productive life.
          </p>
        </div>
      </div>
    </section>
  )
}
