"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

const LABELS: Record<string, string> = {
  dashboard:   "Dashboard",
  pos:         "POS / Kasir",
  products:    "Produk",
  categories:  "Kategori",
  customers:   "Pelanggan",
  transactions:"Transaksi",
  inventory:   "Inventori",
  adjustments: "Penyesuaian",
  movements:   "Riwayat Mutasi",
  suppliers:   "Supplier",
  purchases:   "Pembelian",
  new:         "Baru",
  reports:     "Laporan",
  profit:      "Laba Rugi",
  cashiers:    "Kasir",
  expenses:    "Pengeluaran",
  shifts:      "Shift",
  users:       "Pengguna",
  settings:    "Pengaturan",
  discounts:   "Diskon",
  tables:      "Meja",
  kitchen:     "Dapur",
  notifications:"Notifikasi",
}

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Bangun crumbs: setiap segment punya href kumulatif
  const crumbs = segments.map((seg, idx) => ({
    label: LABELS[seg] ?? (seg.length === 25 ? "Detail" : seg), // cuid ~25 chars
    href:  "/" + segments.slice(0, idx + 1).join("/"),
    isLast: idx === segments.length - 1,
  }))

  if (crumbs.length === 0) return null

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
        <Home className="size-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="size-3.5 shrink-0" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
