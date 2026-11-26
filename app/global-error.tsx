"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center font-sans bg-background text-foreground">
          <div className="flex size-24 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950">
            <span className="text-5xl font-bold text-red-400">500</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Terjadi kesalahan</h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              Server mengalami gangguan. Coba lagi atau hubungi administrator.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground font-mono">ID: {error.digest}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
            >
              Coba Lagi
            </button>
            <Link
              href="/"
              className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Beranda
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
