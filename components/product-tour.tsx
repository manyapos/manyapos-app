"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { driver } from "driver.js"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { tourSteps } from "@/lib/tour-steps"

const TOUR_KEY_PREFIX = "manya-tour-"

export function ProductTour({ autoStart = false }: { autoStart?: boolean }) {
  const pathname = usePathname()
  const driverRef = useRef<ReturnType<typeof driver> | null>(null)

  // Steps untuk halaman ini — fallback ke steps global jika tidak ada
  const steps = tourSteps[pathname] ?? tourSteps["/dashboard"] ?? []
  const tourKey = TOUR_KEY_PREFIX + pathname

  function startTour() {
    if (steps.length === 0) return

    driverRef.current = driver({
      showProgress: true,
      progressText: "{{current}} / {{total}}",
      nextBtnText: "Lanjut →",
      prevBtnText: "← Kembali",
      doneBtnText: "Selesai",
      animate: true,
      overlayOpacity: 0.55,
      popoverClass: "manya-tour-popover",
      steps,
      onDestroyStarted: () => {
        localStorage.setItem(tourKey, "1")
        driverRef.current?.destroy()
      },
    })
    driverRef.current.drive()
  }

  // Load CSS driver.js secara dynamic (hindari SSR error)
  useEffect(() => {
    import("driver.js/dist/driver.css" as never).catch(() => {})
  }, [])

  // Auto-start sekali per halaman (per session)
  useEffect(() => {
    if (!autoStart || steps.length === 0) return
    if (localStorage.getItem(tourKey)) return
    const t = setTimeout(startTour, 900)
    return () => clearTimeout(t)
  }, [pathname])

  if (steps.length === 0) return null

  return (
    <Button
      data-tour="tour-btn"
      variant="ghost"
      size="sm"
      onClick={startTour}
      className="gap-1.5 text-muted-foreground hover:text-foreground"
    >
      <HelpCircle className="size-4" />
      <span className="hidden sm:inline">Panduan</span>
    </Button>
  )
}
