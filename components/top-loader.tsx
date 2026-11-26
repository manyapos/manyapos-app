"use client"

import { useEffect, useRef, useState, useCallback } from "react"

// ponytail: minimal nprogress-style bar; upgrade to framer-motion if needed
export function TopLoader() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval>>(null)

  const start = useCallback(() => {
    setLoading(true)
    setProgress(10)
    timer.current = setInterval(() => {
      setProgress((p) => (p < 90 ? p + (90 - p) * 0.1 : p))
    }, 200)
  }, [])

  const done = useCallback(() => {
    if (timer.current) clearInterval(timer.current)
    setProgress(100)
    setTimeout(() => { setLoading(false); setProgress(0) }, 300)
  }, [])

  useEffect(() => {
    // Intercept link clicks for navigation detection
    function handleClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest("a")
      if (!a) return
      const href = a.getAttribute("href")
      if (!href || href.startsWith("#") || href.startsWith("http") || a.target === "_blank") return
      if (href === window.location.pathname) return
      start()
    }

    // Listen for popstate (back/forward)
    function handlePop() { start() }

    document.addEventListener("click", handleClick, true)
    window.addEventListener("popstate", handlePop)

    // MutationObserver to detect when new page content loads
    const observer = new MutationObserver(() => {
      if (loading) done()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener("click", handleClick, true)
      window.removeEventListener("popstate", handlePop)
      observer.disconnect()
      if (timer.current) clearInterval(timer.current)
    }
  }, [loading, start, done])

  if (!loading && progress === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      />
    </div>
  )
}
