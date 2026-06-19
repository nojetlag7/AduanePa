import Link from "next/link"
import { ArrowRight, Clock, Mail, MapPin, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "Email us",
    body: "Questions about the app, your account, or how AduanePa works.",
    action: "hello@aduanepa.com",
    href: "mailto:hello@aduanepa.com",
  },
  {
    icon: MessageCircle,
    title: "Feedback & partnerships",
    body: "Clinics, schools, or community groups interested in collaborating.",
    action: "partners@aduanepa.com",
    href: "mailto:partners@aduanepa.com",
  },
  {
    icon: Clock,
    title: "Response time",
    body: "We aim to reply within 2 business days. Urgent medical concerns should go to a healthcare provider.",
    action: "Mon – Fri",
    href: undefined,
  },
]

export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-20 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Contact us</h2>
          <p className="mt-3 text-text-secondary">
            We would love to hear from you — whether you are trying the app, reporting an issue, or
            exploring how AduanePa can support your community.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {CONTACT_CHANNELS.map((channel) => {
            const Icon = channel.icon
            const content = (
              <div className="flex h-full flex-col rounded-2xl border border-border-light bg-bg-card p-6 shadow-sm">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="font-semibold text-text-primary">{channel.title}</h3>
                <p className="mt-2 flex-1 text-sm text-text-secondary">{channel.body}</p>
                {channel.href ? (
                  <a
                    href={channel.href}
                    className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {channel.action}
                  </a>
                ) : (
                  <p className="mt-4 text-sm font-medium text-text-primary">{channel.action}</p>
                )}
              </div>
            )
            return <div key={channel.title}>{content}</div>
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-border-light bg-bg-muted/50 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-medium text-text-primary">Built for Ghana</p>
              <p className="mt-1 text-sm text-text-secondary">
                AduanePa is designed with Ghanaian users in mind — from local dishes to Twi and Ga
                language support on our roadmap.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 bg-primary text-white hover:bg-primary-hover">
            <Link href="/register">
              Get started free
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
