"use client"

import { usePathname } from "next/navigation"

export function LayoutMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPos = pathname === "/pos"

  return (
    <main className={isPos ? "flex-1 overflow-hidden" : "flex-1 overflow-y-auto p-3 pb-20 sm:p-6 md:pb-6"}>
      {children}
    </main>
  )
}
