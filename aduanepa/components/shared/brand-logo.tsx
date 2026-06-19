import { cn } from "@/lib/utils"

/**
 * AduanePa logo — fork inside a broken ring.
 * Uses `currentColor` so it inherits whatever text/fill colour the parent sets.
 * Place it inside a <span className="text-primary"> or similar to colour it.
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
        {/* Broken outer ring + fork stem */}
        <path d="M 100 120 L 100 20 A 80 80 0 1 0 140 30.72" />
        {/* Left fork prong */}
        <path d="M 68 120 L 68 70 L 100 70" />
        {/* Right fork prong */}
        <path d="M 132 120 L 132 70 L 100 70" />
        {/* Bottom arc */}
        <path d="M 68 144.73 A 55 55 0 0 0 132 144.73" />
      </g>
    </svg>
  )
}
