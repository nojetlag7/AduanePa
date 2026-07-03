import { cn } from "@/lib/utils"

/**
 * AduanePa logo — fork inside a broken ring.
 * Geometry matches `public/icons/aduanepa_logo.svg`; uses `currentColor` so it
 * inherits the parent's text colour (primary on light UI, white on auth panels).
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M 100 120 L 100 20 A 80 80 0 1 0 140 30.72" />
        <path d="M 68 120 L 68 70 L 100 70" />
        <path d="M 132 120 L 132 70 L 100 70" />
        <path d="M 68 144.73 A 55 55 0 0 0 132 144.73" />
      </g>
    </svg>
  )
}
