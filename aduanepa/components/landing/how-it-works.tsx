"use client"

import * as React from "react"
import { ChartLine, UserCircle, UtensilsCrossed, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = {
  title: string
  body: string
}

type HowItWorksProps = {
  steps: Step[]
}

const STEP_ICONS: LucideIcon[] = [UserCircle, UtensilsCrossed, ChartLine]

const STAGGER_MS = 180
const CONNECTOR_DELAY_MS = 600
const CONNECTOR_STAGGER_MS = 300

function StepConnector({ filled }: { filled: boolean }) {
  return (
    <div
      className="relative mt-9 h-0.5 w-8 shrink-0 overflow-hidden bg-primary/15 sm:flex-1 sm:max-w-20"
      aria-hidden="true"
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 h-full bg-linear-to-r from-primary to-primary-light transition-[width] duration-600 ease-out",
          filled ? "w-full" : "w-0"
        )}
      />
    </div>
  )
}

function StepItem({
  step,
  index,
  icon: Icon,
  visible,
  isActive,
  onActivate,
}: {
  step: Step
  index: number
  icon: LucideIcon
  visible: boolean
  isActive: boolean
  onActivate: () => void
}) {
  return (
    <li
      className={cn(
        "group flex w-full max-w-[10rem] flex-col items-center text-center transition-all duration-500 sm:w-40",
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      )}
      style={{ transitionDelay: visible ? `${index * STAGGER_MS}ms` : "0ms" }}
    >
      <button
        type="button"
        className="flex flex-col items-center rounded-lg outline-none"
        aria-pressed={isActive}
        onClick={onActivate}
        onMouseEnter={onActivate}
        onFocus={onActivate}
      >
        <span
          className={cn(
            "relative mb-5 flex h-18 w-18 items-center justify-center rounded-full border-[1.5px] border-primary/30 bg-bg-card/80 shadow-card transition-all duration-300",
            "group-hover:scale-[1.08] group-hover:border-primary group-hover:bg-primary/10 group-hover:shadow-[0_0_24px_-4px] group-hover:shadow-primary/30",
            "group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-bg-main",
            isActive && "scale-[1.08] border-primary bg-primary/10 shadow-[0_0_28px_-4px] shadow-primary/35"
          )}
        >
          <span
            className={cn(
              "pointer-events-none absolute -inset-1.5 rounded-full border border-transparent transition-all duration-300",
              isActive && "-inset-2.5 border-primary/15"
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              "font-display text-2xl font-bold text-primary transition-colors duration-300",
              isActive && "text-primary-light"
            )}
          >
            {index + 1}
          </span>
        </span>

        <Icon
          className={cn(
            "mb-1 h-5 w-5 text-primary opacity-0 translate-y-1 transition-all duration-300",
            "group-hover:opacity-100 group-hover:translate-y-0",
            isActive && "opacity-100 translate-y-0"
          )}
          aria-hidden="true"
        />

        <h3
          className={cn(
            "mb-2 text-sm font-semibold text-text-primary transition-colors duration-300 sm:text-base",
            isActive && "text-text-primary"
          )}
        >
          {step.title}
        </h3>
        <p
          className={cn(
            "text-xs leading-relaxed text-text-muted transition-all duration-300 sm:text-[13px]",
            isActive && "text-text-secondary"
          )}
        >
          {step.body}
        </p>
      </button>
    </li>
  )
}

export function HowItWorks({ steps }: HowItWorksProps) {
  const sectionRef = React.useRef<HTMLElement>(null)
  const [inView, setInView] = React.useState(false)
  const [filledConnectors, setFilledConnectors] = React.useState([false, false])
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setInView(true)
      setFilledConnectors([true, true])
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!inView) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setFilledConnectors([true, true])
      return
    }

    const t1 = window.setTimeout(
      () => setFilledConnectors((prev) => [true, prev[1]]),
      CONNECTOR_DELAY_MS
    )
    const t2 = window.setTimeout(
      () => setFilledConnectors([true, true]),
      CONNECTOR_DELAY_MS + CONNECTOR_STAGGER_MS
    )
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [inView])

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative scroll-mt-20 py-16 lg:py-24"
      aria-labelledby="how-it-works-heading"
    >
      {/* Local centre glow — does not change page background */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-72 w-[min(100%,600px)] bg-[radial-gradient(ellipse,rgba(74,222,128,0.07)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse,rgba(74,222,128,0.1)_0%,transparent_70%)]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            Simple by design
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-3 font-display text-3xl font-bold sm:text-4xl"
          >
            How it works
          </h2>
          <p className="mt-3 text-text-secondary">
            Three steps to a plan that fits your life.
          </p>
        </header>

        {/* Desktop / tablet — horizontal stepper */}
        <ol className="mx-auto hidden max-w-3xl items-start justify-center sm:flex">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? UserCircle
            const isActive = activeIndex === index
            return (
              <React.Fragment key={step.title}>
                <StepItem
                  step={step}
                  index={index}
                  icon={Icon}
                  visible={inView}
                  isActive={isActive}
                  onActivate={() => setActiveIndex(index)}
                />
                {index < steps.length - 1 && (
                  <StepConnector filled={filledConnectors[index] ?? false} />
                )}
              </React.Fragment>
            )
          })}
        </ol>

        {/* Mobile — vertical stepper */}
        <ol className="mx-auto flex max-w-xs flex-col items-center gap-10 sm:hidden">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? UserCircle
            const isActive = activeIndex === index
            return (
              <React.Fragment key={step.title}>
                <StepItem
                  step={step}
                  index={index}
                  icon={Icon}
                  visible={inView}
                  isActive={isActive}
                  onActivate={() => setActiveIndex(index)}
                />
                {index < steps.length - 1 && (
                  <div
                    className="h-8 w-0.5 overflow-hidden rounded-full bg-primary/15"
                    aria-hidden="true"
                  >
                    <div
                      className={cn(
                        "w-full bg-linear-to-b from-primary to-primary-light transition-[height] duration-600 ease-out",
                        inView ? "h-full" : "h-0"
                      )}
                      style={{ transitionDelay: `${CONNECTOR_DELAY_MS + index * CONNECTOR_STAGGER_MS}ms` }}
                    />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
