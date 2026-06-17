import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = {
  title: string
  body: string
}

type HowItWorksProps = {
  steps: Step[]
}

function StepBubble({ step, index }: { step: Step; index: number }) {
  return (
    <article
      className={cn(
        "flex w-[min(100%,15rem)] shrink-0 flex-col items-center rounded-3xl border border-border-light bg-bg-main px-5 py-5 text-center shadow-sm",
        "transition-all duration-200 hover:border-primary/30 hover:shadow-md",
        "dark:border-white/8 dark:bg-bg-muted/40 sm:w-52"
      )}
    >
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-white shadow-sm">
        {index + 1}
      </span>
      <h3 className="font-display text-base font-semibold text-text-primary sm:text-lg">
        {step.title}
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-text-secondary sm:text-sm">
        {step.body}
      </p>
    </article>
  )
}

function FlowConnector({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex shrink-0 items-center justify-center gap-0.5 text-primary/50", className)}
    >
      <span className="h-px w-6 bg-primary/35 sm:w-10" />
      <ArrowRight className="h-4 w-4 shrink-0 stroke-[2.5]" />
      <span className="h-px w-6 bg-primary/35 sm:w-10" />
    </div>
  )
}

export function HowItWorks({ steps }: HowItWorksProps) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Desktop & tablet: straight horizontal flow on one line */}
      <ol className="hidden items-center justify-center gap-2 sm:flex">
        {steps.map((step, index) => (
          <li key={step.title} className="flex items-center">
            <StepBubble step={step} index={index} />
            {index < steps.length - 1 && <FlowConnector className="px-1 sm:px-2" />}
          </li>
        ))}
      </ol>

      {/* Mobile: horizontal scroll, same inline flow */}
      <ol className="flex items-center gap-2 overflow-x-auto pb-1 sm:hidden">
        {steps.map((step, index) => (
          <li key={step.title} className="flex items-center">
            <StepBubble step={step} index={index} />
            {index < steps.length - 1 && <FlowConnector className="px-1" />}
          </li>
        ))}
      </ol>
    </div>
  )
}
