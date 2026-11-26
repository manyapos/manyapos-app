import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex size-24 items-center justify-center rounded-2xl bg-muted">
        <span className="text-5xl font-bold text-muted-foreground">404</span>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
