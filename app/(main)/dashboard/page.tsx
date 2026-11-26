import { prisma } from "@/lib/prisma"
import { formatRupiah } from "@/lib/format"
import { ShoppingCart, Receipt, TrendingUp, Package, AlertTriangle } from "lucide-react"
import { DashboardCharts } from "@/components/dashboard-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentTransactionsTable } from "@/components/dashboard/recent-transactions-table"
import { PageTitle } from "@/components/ui/page-title"

async function getStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [todayTx, totalProducts, recentTx] = await Promise.all([
    prisma.transaction.findMany({ where: { createdAt: { gte: today }, status: "completed" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.transaction.findMany({
      where: { status: "completed" },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { name: true } } },
    }),
  ])

  const allActiveProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, stock: true, minStock: true, unit: true },
  })
  const lowStockProducts = allActiveProducts.filter(p => p.stock <= p.minStock).slice(0, 5)

  const todaySales = todayTx.reduce((s, t) => s + t.total, 0)
  const todayCount = todayTx.length
  const avgTransaction = todayCount ? Math.round(todaySales / todayCount) : 0

  const days: { date: string; total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    const txs = recentTx.filter((t) => t.createdAt >= d && t.createdAt < next)
    days.push({ date: d.toLocaleDateString("id-ID", { weekday: "short" }), total: txs.reduce((s, t) => s + t.total, 0) / 100 })
  }

  return { todaySales, todayCount, avgTransaction, totalProducts, days, recentTx: recentTx.slice(0, 5), lowStockProducts }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: "Penjualan Hari Ini", value: formatRupiah(stats.todaySales), icon: TrendingUp, color: "text-emerald-600" },
    { label: "Transaksi Hari Ini", value: String(stats.todayCount), icon: Receipt, color: "text-blue-600" },
    { label: "Rata-rata Transaksi", value: formatRupiah(stats.avgTransaction), icon: ShoppingCart, color: "text-amber-600" },
    { label: "Total Produk Aktif", value: String(stats.totalProducts), icon: Package, color: "text-violet-600" },
  ]

  return (
    <div className="space-y-6">
      <PageTitle title="Dashboard" description="Ringkasan performa toko hari ini: penjualan, transaksi, produk terlaris, dan stok rendah." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="summary-cards">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <c.icon className={`size-5 ${c.color}`} />
              </div>
              <p className="mt-2 text-2xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <DashboardCharts data={stats.days} data-tour="sales-chart" />

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTransactionsTable transactions={stats.recentTx} />
        </CardContent>
      </Card>

      {stats.lowStockProducts.length > 0 && (
        <Card data-tour="low-stock">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="size-4" />
              Stok Hampir Habis ({stats.lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {stats.lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-amber-600 font-semibold">{p.stock} {p.unit} <span className="text-muted-foreground font-normal">(min {p.minStock})</span></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
