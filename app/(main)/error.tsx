"use client"

import { useEffect } from "react"

export default function Error({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950">
        <span className="text-4xl font-bold text-red-400">!</span>
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Halaman ini tidak dapat dimuat. Coba lagi atau muat ulang halaman.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">ID: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  )
}
