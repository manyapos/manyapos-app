import { prisma } from "@/lib/prisma"
import { formatRupiah } from "@/lib/format"
import { ExpenseActions } from "@/components/expenses/expense-actions"
import { Card, CardContent } from "@/components/ui/card"
import { ExpensesTable } from "@/components/expenses/expenses-table"
import { FilterBar } from "@/components/ui/filter-bar"
import { Suspense } from "react"
import { PageTitle } from "@/components/ui/page-title"

type SP = { from?: string; to?: string; category?: string }

const FILTERS = [
  { type: "daterange" as const, fromKey: "from", toKey: "to", label: "Tanggal" },
  {
    key: "category", label: "Kategori", type: "select" as const,
    options: [
      { value: "operasional", label: "Operasional" },
      { value: "pembelian", label: "Pembelian" },
      { value: "gaji", label: "Gaji" },
      { value: "utilitas", label: "Utilitas" },
      { value: "lainnya", label: "Lainnya" },
    ],
  },
]

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const p = await searchParams

  const where: Record<string, unknown> = {}
  if (p.from || p.to) {
    where.date = {
      ...(p.from ? { gte: new Date(p.from) } : {}),
      ...(p.to ? { lte: new Date(p.to + "T23:59:59") } : {}),
    }
  }
  if (p.category) where.category = { contains: p.category, mode: "insensitive" }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
    include: { user: { select: { name: true } } },
    take: 200,
  })

  const now = new Date()
  const totalThisMonth = expenses
    .filter(e => e.date.getMonth() === now.getMonth() && e.date.getFullYear() === now.getFullYear())
    .reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle title="Pengeluaran" description="Catat dan pantau semua pengeluaran operasional toko per kategori." />
        <div data-tour="add-expense-btn"><ExpenseActions /></div>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total Pengeluaran Bulan Ini</p>
          <p className="mt-1 text-2xl font-bold">{formatRupiah(totalThisMonth)}</p>
        </CardContent>
      </Card>

      <Suspense>
        <FilterBar filters={FILTERS} />
      </Suspense>
      <div data-tour="expense-table"><ExpensesTable expenses={expenses} /></div>
    </div>
  )
}
