import { prisma } from "@/lib/prisma"
import { formatRupiah } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ProfitCharts } from "@/components/reports/profit-charts"
import { ExpenseCategoryTable } from "@/components/reports/expense-category-table"
import { DateRangePicker } from "@/components/ui/date-picker"
import { Suspense } from "react"
import { PageTitle } from "@/components/ui/page-title"

export default async function ProfitReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const from = params.from ? new Date(params.from) : new Date(now.getFullYear(), now.getMonth(), 1)
  const to = params.to ? new Date(params.to + "T23:59:59") : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [transactions, expenses] = await Promise.all([
    prisma.transaction.findMany({
      where: { status: "completed", createdAt: { gte: from, lte: to } },
      include: { items: { include: { product: { select: { costPrice: true } } } } },
    }),
    prisma.expense.findMany({
      where: { date: { gte: from, lte: to } },
    }),
  ])

  // Revenue & COGS
  let revenue = 0
  let cogs = 0
  for (const tx of transactions) {
    revenue += tx.total
    for (const item of tx.items) {
      cogs += item.product.costPrice * item.quantity
    }
  }

  const grossProfit = revenue - cogs
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0

  // Expenses per category
  const expenseByCategory = new Map<string, number>()
  let totalExpenses = 0
  for (const e of expenses) {
    expenseByCategory.set(e.category, (expenseByCategory.get(e.category) || 0) + e.amount)
    totalExpenses += e.amount
  }

  const netProfit = grossProfit - totalExpenses
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

  // Daily breakdown for chart
  const dailyMap = new Map<string, { revenue: number; cogs: number; expenses: number }>()
  for (const tx of transactions) {
    const key = tx.createdAt.toISOString().slice(0, 10)
    const d = dailyMap.get(key) || { revenue: 0, cogs: 0, expenses: 0 }
    d.revenue += tx.total
    for (const item of tx.items) d.cogs += item.product.costPrice * item.quantity
    dailyMap.set(key, d)
  }
  for (const e of expenses) {
    const key = e.date.toISOString().slice(0, 10)
    const d = dailyMap.get(key) || { revenue: 0, cogs: 0, expenses: 0 }
    d.expenses += e.amount
    dailyMap.set(key, d)
  }
  const dailyData = Array.from(dailyMap, ([date, v]) => ({
    date,
    revenue: v.revenue / 100,
    cogs: v.cogs / 100,
    expenses: v.expenses / 100,
    profit: (v.revenue - v.cogs - v.expenses) / 100,
  })).sort((a, b) => a.date.localeCompare(b.date))

  const summaryCards = [
    { label: "Total Pendapatan", value: formatRupiah(revenue), sub: `${transactions.length} transaksi` },
    { label: "HPP (COGS)", value: formatRupiah(cogs), sub: "Harga modal produk terjual" },
    { label: "Laba Kotor", value: formatRupiah(grossProfit), sub: `Margin ${grossMargin.toFixed(1)}%`, highlight: grossProfit >= 0 },
    { label: "Total Pengeluaran", value: formatRupiah(totalExpenses), sub: `${expenses.length} entri` },
    { label: "Laba Bersih", value: formatRupiah(netProfit), sub: `Margin ${netMargin.toFixed(1)}%`, highlight: netProfit >= 0, large: true },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="Laporan Laba Rugi" description="Kalkulasi laba bersih: pendapatan dikurangi HPP (COGS) dan total pengeluaran per periode." />
        <Suspense>
          <DateRangePicker placeholder="Pilih periode" />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" data-tour="profit-summary">
        {summaryCards.map((c) => (
          <Card key={c.label} className={c.large ? "sm:col-span-2 lg:col-span-1" : ""}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className={`mt-1 text-xl font-bold ${c.highlight === false ? "text-destructive" : c.highlight ? "text-green-600" : ""}`}>
                {c.value}
              </p>
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div data-tour="profit-chart"><ProfitCharts data={dailyData} /></div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rincian Pengeluaran */}
        <Card>
          <CardHeader><CardTitle>Rincian Pengeluaran</CardTitle></CardHeader>
          <CardContent>
            <ExpenseCategoryTable
              data={Array.from(expenseByCategory, ([cat, amt]) => ({
                cat,
                amt,
                pct: totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : "0",
              })).sort((a, b) => b.amt - a.amt)}
            />
          </CardContent>
        </Card>

        {/* Ringkasan Laba Rugi */}
        <Card>
          <CardHeader><CardTitle>Ringkasan</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { label: "Pendapatan Penjualan", value: revenue, bold: false },
              { label: "(-) HPP", value: -cogs, bold: false },
            ].map((r) => (
              <div key={r.label} className="flex justify-between">
                <span className="text-muted-foreground">{r.label}</span>
                <span className={r.value < 0 ? "text-destructive" : ""}>{formatRupiah(Math.abs(r.value))}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Laba Kotor</span>
              <span className={grossProfit < 0 ? "text-destructive" : "text-green-600"}>{formatRupiah(grossProfit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">(-) Total Pengeluaran</span>
              <span className="text-destructive">{formatRupiah(totalExpenses)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Laba Bersih</span>
              <span className={netProfit < 0 ? "text-destructive" : "text-green-600"}>{formatRupiah(netProfit)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
