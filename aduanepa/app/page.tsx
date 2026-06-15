import Link from "next/link"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-bg-main px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <Leaf className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <h1 className="font-display text-4xl font-bold text-text-primary">AduanePa</h1>
        <p className="max-w-sm text-sm text-text-secondary">
          AI-powered nutrition and meal recommendations built for Ghanaian users.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="bg-primary text-white hover:bg-primary-hover">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/register">Create account</Link>
        </Button>
      </div>
    </div>
  )
}
