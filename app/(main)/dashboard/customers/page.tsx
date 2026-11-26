import { prisma } from "@/lib/prisma"
import { CustomerActions } from "@/components/customers/customer-actions"
import { CustomersTable } from "@/components/customers/customers-table"
import { FilterBar } from "@/components/ui/filter-bar"
import { Suspense } from "react"
import { PageTitle } from "@/components/ui/page-title"

type SP = { tier?: string; search?: string }

const FILTERS = [
  {
    key: "tier", label: "Tier", type: "select" as const,
    options: [
      { value: "regular", label: "Regular" },
      { value: "silver", label: "Silver" },
      { value: "gold", label: "Gold" },
      { value: "platinum", label: "Platinum" },
    ],
  },
]

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const p = await searchParams

  const where: Record<string, unknown> = {}
  if (p.tier) where.tier = p.tier

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { transactions: true } } },
  }) as ((Awaited<ReturnType<typeof prisma.customer.findMany>>[number] & { _count: { transactions: number } })[])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle title="Pelanggan" description="Daftar pelanggan beserta tier loyalitas, total belanja, dan poin yang dimiliki." />
        <CustomerActions />
      </div>
      <Suspense>
        <FilterBar filters={FILTERS} />
      </Suspense>
      <CustomersTable customers={customers} />
    </div>
  )
}
