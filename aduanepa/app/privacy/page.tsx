import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PrivacyPolicyContent } from "@/components/legal/privacy-policy-content"
import { BrandLogo } from "@/components/shared/brand-logo"

export const metadata: Metadata = {
  title: "Privacy Policy · AduanePa",
  description: "How AduanePa collects, uses, and protects your personal and health data.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg-main text-text-primary">
      <header className="border-b border-border-light bg-bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <BrandLogo className="h-8 w-8 text-primary" />
            <span className="font-display text-lg font-bold">AduanePa</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <PrivacyPolicyContent />
      </main>
    </div>
  )
}
