"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { driver } from "driver.js"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { tourSteps } from "@/lib/tour-steps"

export function ProductTour() {
  const pathname = usePathname()
  const driverRef = useRef<ReturnType<typeof driver> | null>(null)

  const steps = tourSteps[pathname] ?? []

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
        driverRef.current?.destroy()
      },
    })
    driverRef.current.drive()
  }

  useEffect(() => {
    import("driver.js/dist/driver.css" as never).catch(() => {})
  }, [])

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
