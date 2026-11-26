import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { ShiftActions } from "@/components/shifts/shift-actions"
import { ShiftsTable } from "@/components/shifts/shifts-table"
import { FilterBar } from "@/components/ui/filter-bar"
import { Suspense } from "react"
import { PageTitle } from "@/components/ui/page-title"

type SP = { from?: string; to?: string; status?: string }

const FILTERS = [
  { type: "daterange" as const, fromKey: "from", toKey: "to", label: "Tanggal" },
  {
    key: "status", label: "Status", type: "select" as const,
    options: [
      { value: "open", label: "Aktif" },
      { value: "closed", label: "Selesai" },
    ],
  },
]

export default async function ShiftsPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const session = await auth()
  const role = (session?.user as { role: string })?.role
  const p = await searchParams

  const where: Record<string, unknown> = role === "CASHIER" ? { userId: session!.user!.id } : {}
  if (p.status) where.status = p.status
  if (p.from || p.to) {
    where.startTime = {
      ...(p.from ? { gte: new Date(p.from) } : {}),
      ...(p.to ? { lte: new Date(p.to + "T23:59:59") } : {}),
    }
  }

  const shifts = await prisma.shift.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const activeShift = await prisma.shift.findFirst({
    where: { userId: session!.user!.id, status: "open" },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle title="Shift" description="Riwayat shift kasir. Buka atau tutup shift, dan lihat rekap penjualan per shift." />
        <div data-tour="open-shift-btn"><ShiftActions activeShift={activeShift} /></div>
      </div>
      <Suspense>
        <FilterBar filters={FILTERS} />
      </Suspense>
      <div data-tour="shift-table"><ShiftsTable shifts={shifts} /></div>
    </div>
  )
}
