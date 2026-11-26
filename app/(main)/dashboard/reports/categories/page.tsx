import { prisma } from "@/lib/prisma"
import { PageTitle } from "@/components/ui/page-title"
import { Card, CardContent } from "@/components/ui/card"
import { formatRupiah } from "@/lib/format"
import { CategoryCharts } from "@/components/reports/category-charts"

export default async function CategoryReportPage() {
  // Group penjualan per kategori via product → category
  const txItems = await prisma.transactionItem.findMany({
    where: { transaction: { status: "completed" } },
    select: { productId: true, quantity: true, subtotal: true },
  })

  const productIds = [...new Set(txItems.map(i => i.productId))]
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, categoryId: true, category: { select: { name: true } } },
  })
  const productCatMap = Object.fromEntries(products.map(p => [p.id, p.category?.name ?? "Tanpa Kategori"]))

  // Aggregate by category
  const byCategory: Record<string, { total: number; qty: number }> = {}
  for (const item of txItems) {
    const cat = productCatMap[item.productId] ?? "Tanpa Kategori"
    if (!byCategory[cat]) byCategory[cat] = { total: 0, qty: 0 }
    byCategory[cat].total += item.subtotal
    byCategory[cat].qty   += item.quantity
  }

  const data = Object.entries(byCategory)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.total - a.total)

  const grandTotal = data.reduce((s, d) => s + d.total, 0)

  return (
    <div className="space-y-6">
      <PageTitle title="Laporan Kategori" description="Penjualan dan kontribusi per kategori produk." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="mt-1 text-xl font-bold">{formatRupiah(grandTotal)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Jumlah Kategori</p>
          <p className="mt-1 text-xl font-bold">{data.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Kategori Teratas</p>
          <p className="mt-1 text-xl font-bold">{data[0]?.name ?? "—"}</p>
        </CardContent></Card>
      </div>

      <CategoryCharts data={data} />

      {/* Tabel detail */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">#</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Kategori</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Qty Terjual</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Revenue</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Kontribusi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((cat, idx) => (
                <tr key={cat.name} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-right">{cat.qty.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-right">{formatRupiah(cat.total)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {grandTotal > 0 ? `${((cat.total / grandTotal) * 100).toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Belum ada data transaksi</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
