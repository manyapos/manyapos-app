import { prisma } from "@/lib/prisma"
import { PageTitle } from "@/components/ui/page-title"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/format"
import { User } from "lucide-react"

export default async function CashierReportPage() {
  const cashiers = await prisma.user.findMany({
    where: { role: { in: ["CASHIER", "MANAGER", "ADMIN"] } },
    select: {
      id: true, name: true, role: true,
      transactions: {
        where: { status: "completed" },
        select: { total: true, createdAt: true },
      },
    },
    orderBy: { name: "asc" },
  })

  const data = cashiers.map(c => {
    const txs = c.transactions
    const totalSales = txs.reduce((s, t) => s + t.total, 0)
    const txCount    = txs.length
    const avg        = txCount > 0 ? Math.round(totalSales / txCount) : 0
    return { id: c.id, name: c.name, role: c.role, totalSales, txCount, avg }
  }).sort((a, b) => b.totalSales - a.totalSales)

  const grandTotal = data.reduce((s, c) => s + c.totalSales, 0)
  const grandCount = data.reduce((s, c) => s + c.txCount, 0)

  const ROLE_LABEL: Record<string, string> = { ADMIN: "Admin", MANAGER: "Manager", CASHIER: "Kasir" }
  const ROLE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
    ADMIN: "default", MANAGER: "secondary", CASHIER: "outline",
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Laporan Kasir" description="Performa penjualan per kasir." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Penjualan</p>
          <p className="mt-1 text-xl font-bold">{formatRupiah(grandTotal)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Transaksi</p>
          <p className="mt-1 text-xl font-bold">{grandCount.toLocaleString("id-ID")}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Rata-rata per Transaksi</p>
          <p className="mt-1 text-xl font-bold">{formatRupiah(grandCount > 0 ? Math.round(grandTotal / grandCount) : 0)}</p>
        </CardContent></Card>
      </div>

      <Card data-tour="cashier-table">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">#</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-left">Kasir</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Transaksi</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Total Penjualan</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Rata-rata</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Kontribusi</th>
                </tr>
              </thead>
            <tbody className="divide-y">
              {data.map((c, idx) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-muted">
                        <User className="size-3.5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={ROLE_VARIANT[c.role]}>{ROLE_LABEL[c.role] ?? c.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">{c.txCount.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatRupiah(c.totalSales)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatRupiah(c.avg)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {grandTotal > 0 ? `${((c.totalSales / grandTotal) * 100).toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Belum ada data</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
