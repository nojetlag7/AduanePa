"use client"

import * as React from "react"

/**
 * Measures its own width with a ResizeObserver and only renders the chart once
 * a real (> 0) width is known, passing concrete numeric `width`/`height` to the
 * child. This avoids Recharts' `ResponsiveContainer` warning
 * ("The width(-1) and height(-1) of chart should be greater than 0…"), which
 * fires when the container is measured as 0 on the first (dev/StrictMode)
 * render.
 */
export function ResponsiveChart({
  height,
  children,
  className,
}: {
  height: number
  children: (width: number, height: number) => React.ReactNode
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    setWidth(el.clientWidth)
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width
      if (next != null) setWidth(next)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} style={{ width: "100%", height }}>
      {width > 0 ? children(width, height) : null}
    </div>
  )
}
