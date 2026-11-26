import { prisma } from "@/lib/prisma"
import { TransactionsTable } from "@/components/transactions/transactions-table"
import { FilterBar } from "@/components/ui/filter-bar"
import { Suspense } from "react"
import { PageTitle } from "@/components/ui/page-title"

type SP = { from?: string; to?: string; status?: string; method?: string; userId?: string }

const FILTERS = [
  { type: "daterange" as const, fromKey: "from", toKey: "to", label: "Tanggal" },
  {
    key: "status", label: "Status", type: "select" as const,
    options: [
      { value: "completed", label: "Selesai" },
      { value: "voided", label: "Void" },
      { value: "refunded", label: "Refund" },
      { value: "pending", label: "Pending" },
    ],
  },
  {
    key: "method", label: "Metode", type: "select" as const,
    options: [
      { value: "cash", label: "Tunai" },
      { value: "qris", label: "QRIS" },
      { value: "card", label: "Kartu" },
      { value: "ewallet", label: "E-Wallet" },
      { value: "credit", label: "Kredit" },
    ],
  },
]

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const p = await searchParams

  const where: Record<string, unknown> = {}
  if (p.from || p.to) {
    where.createdAt = {
      ...(p.from ? { gte: new Date(p.from) } : {}),
      ...(p.to ? { lte: new Date(p.to + "T23:59:59") } : {}),
    }
  }
  if (p.status) where.status = p.status
  if (p.method) where.paymentMethod = p.method

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } }, customer: { select: { name: true } }, items: true },
    take: 200,
  })

  return (
    <div className="space-y-4">
      <PageTitle title="Transaksi" description="Riwayat semua transaksi penjualan. Filter berdasarkan tanggal, status, dan metode pembayaran." />
      <Suspense>
        <div data-tour="transaction-filter">
          <FilterBar filters={FILTERS} />
        </div>
      </Suspense>
      <div data-tour="transaction-table">
        <TransactionsTable transactions={transactions} />
      </div>
    </div>
  )
}
