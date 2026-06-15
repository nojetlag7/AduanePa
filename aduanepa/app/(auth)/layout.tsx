import Link from "next/link"
import { Leaf } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-main px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Leaf className="h-5 w-5 text-white" aria-hidden="true" />
        </span>
        <span className="font-display text-2xl font-bold text-text-primary">AduanePa</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
