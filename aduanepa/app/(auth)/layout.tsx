import Link from "next/link"
import { BrandLogo } from "@/components/shared/brand-logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-main px-4 py-10 dark:bg-transparent">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 transition-opacity duration-200 hover:opacity-90"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
          <BrandLogo className="h-6 w-6 text-white" />
        </span>
        <span className="font-display text-2xl font-bold text-text-primary">AduanePa</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
