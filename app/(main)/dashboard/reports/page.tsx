import { prisma } from "@/lib/prisma"
import { formatRupiah } from "@/lib/format"
import { ReportsCharts } from "@/components/reports/reports-charts"
import { TopProductsTable } from "@/components/reports/top-products-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FilterBar } from "@/components/ui/filter-bar"
import { Suspense } from "react"
import { PageTitle } from "@/components/ui/page-title"
import Link from "next/link"

type SP = { from?: string; to?: string }

const FILTERS = [
  { type: "daterange" as const, fromKey: "from", toKey: "to", label: "Rentang Tanggal", placeholder: "Pilih periode laporan" },
]

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const p = await searchParams
  const now = new Date()

  const from = p.from ? new Date(p.from) : new Date(now.getTime() - 30 * 86400000)
  const to = p.to ? new Date(p.to + "T23:59:59") : now

  const transactions = await prisma.transaction.findMany({
    where: { status: "completed", createdAt: { gte: from, lte: to } },
    include: { items: { include: { product: { select: { name: true, categoryId: true } } } } },
    orderBy: { createdAt: "asc" },
  })

  const dailyMap = new Map<string, number>()
  for (const tx of transactions) {
    const key = tx.createdAt.toISOString().slice(0, 10)
    dailyMap.set(key, (dailyMap.get(key) || 0) + tx.total)
  }
  const dailySales = Array.from(dailyMap, ([date, total]) => ({ date, total: total / 100 }))

  const productMap = new Map<string, { name: string; quantity: number; revenue: number }>()
  for (const tx of transactions) {
    for (const item of tx.items) {
      const e = productMap.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 }
      e.quantity += item.quantity
      e.revenue += item.subtotal
      productMap.set(item.productId, e)
    }
  }
  const topProducts = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10)

  const categories = await prisma.category.findMany()
  const catMap = new Map<string, number>()
  for (const tx of transactions) {
    for (const item of tx.items) {
      catMap.set(item.product.categoryId, (catMap.get(item.product.categoryId) || 0) + item.subtotal)
    }
  }
  const categoryData = categories
    .map(c => ({ name: c.name, value: (catMap.get(c.id) || 0) / 100 }))
    .filter(c => c.value > 0)

  const totalRevenue = transactions.reduce((s, t) => s + t.total, 0)
  const totalTx = transactions.length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="Laporan Penjualan" description="Grafik dan ringkasan penjualan harian, produk terlaris, dan distribusi per kategori." />
        <Suspense>
          <div data-tour="date-filter">
            <FilterBar filters={FILTERS} />
          </div>
        </Suspense>
      </div>

      <div data-tour="report-nav" className="flex flex-wrap gap-2">
        {[
          { href: "/dashboard/reports/products", label: "Per Produk" },
          { href: "/dashboard/reports/categories", label: "Per Kategori" },
          { href: "/dashboard/reports/cashiers", label: "Per Kasir" },
          { href: "/dashboard/reports/profit", label: "Laba Rugi" },
        ].map(l => (
          <Link key={l.href} href={l.href} className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors">{l.label}</Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Penjualan", value: formatRupiah(totalRevenue) },
          { label: "Jumlah Transaksi", value: String(totalTx) },
          { label: "Rata-rata Transaksi", value: formatRupiah(totalTx ? Math.round(totalRevenue / totalTx) : 0) },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReportsCharts dailySales={dailySales} categoryData={categoryData} />

      <Card>
        <CardHeader><CardTitle>Produk Terlaris</CardTitle></CardHeader>
        <CardContent>
          <TopProductsTable products={topProducts} />
        </CardContent>
      </Card>
    </div>
  )
}
