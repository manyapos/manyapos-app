import { prisma } from "@/lib/prisma"
import { PageTitle } from "@/components/ui/page-title"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/format"
import { TrendingUp, TrendingDown, Package } from "lucide-react"

export default async function ProductReportPage() {
  // Aggregate penjualan per produk dari TransactionItem
  const rawItems = await prisma.transactionItem.groupBy({
    by: ["productId", "productName"],
    where: { transaction: { status: "completed" } },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { subtotal: "desc" } },
  })

  // Ambil costPrice produk untuk hitung margin
  const productIds = rawItems.map(i => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, costPrice: true, price: true, stock: true, minStock: true },
  })
  const productMap = Object.fromEntries(products.map(p => [p.id, p]))

  const items = rawItems.map(i => {
    const p = productMap[i.productId]
    const revenue = i._sum.subtotal ?? 0
    const qty = i._sum.quantity ?? 0
    const cogs = p ? p.costPrice * qty : 0
    const gross = revenue - cogs
    const margin = revenue > 0 ? Math.round((gross / revenue) * 100) : 0
    return { ...i, revenue, qty, gross, margin, stock: p?.stock ?? 0, minStock: p?.minStock ?? 0 }
  })

  const top10 = items.slice(0, 10)
  const bottom10 = [...items].sort((a, b) => a.revenue - b.revenue).slice(0, 10)
  const totalRevenue = items.reduce((s, i) => s + i.revenue, 0)
  const totalGross   = items.reduce((s, i) => s + i.gross, 0)

  return (
    <div className="space-y-6">
      <PageTitle title="Laporan Produk" description="Performa penjualan dan margin per produk." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Revenue Produk</p>
          <p className="mt-1 text-xl font-bold">{formatRupiah(totalRevenue)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Laba Kotor</p>
          <p className="mt-1 text-xl font-bold">{formatRupiah(totalGross)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Margin Rata-rata</p>
          <p className="mt-1 text-xl font-bold">
            {totalRevenue > 0 ? Math.round((totalGross / totalRevenue) * 100) : 0}%
          </p>
        </CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Selling */}
        <Card data-tour="top-products">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="size-4 text-green-500" />Top 10 Terlaris</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-2 font-medium text-muted-foreground">Produk</th>
                  <th className="px-4 py-2 font-medium text-muted-foreground text-right">Qty</th>
                  <th className="px-4 py-2 font-medium text-muted-foreground text-right">Revenue</th>
                  <th className="px-4 py-2 font-medium text-muted-foreground text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {top10.map((item, idx) => (
                  <tr key={item.productId} className="hover:bg-muted/30">
                    <td className="px-4 py-2 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-2">
                      <p className="font-medium">{item.productName}</p>
                      {item.stock <= item.minStock && (
                        <Badge variant="destructive" className="text-xs mt-0.5">Stok Rendah</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">{item.qty.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(item.revenue)}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={item.margin >= 20 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                        {item.margin}%
                      </span>
                    </td>
                  </tr>
                ))}
                {top10.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Bottom Selling */}
        <Card data-tour="bottom-products">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingDown className="size-4 text-red-500" />10 Penjualan Terendah</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium text-muted-foreground">Produk</th>
                  <th className="px-4 py-2 font-medium text-muted-foreground text-right">Qty</th>
                  <th className="px-4 py-2 font-medium text-muted-foreground text-right">Revenue</th>
                  <th className="px-4 py-2 font-medium text-muted-foreground text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bottom10.map((item) => (
                  <tr key={item.productId} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">{item.productName}</td>
                    <td className="px-4 py-2 text-right">{item.qty.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-2 text-right">{formatRupiah(item.revenue)}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">{item.margin}%</td>
                  </tr>
                ))}
                {bottom10.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Belum ada data</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
