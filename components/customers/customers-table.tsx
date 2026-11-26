"use client"

import { type ColumnDef } from "@/components/ui/data-table"
import { DataTable } from "@/components/ui/data-table"
import { formatRupiah } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type Customer = {
  id: string
  name: string
  phone: string | null
  totalSpent: number
  tier: string
  _count: { transactions: number }
}

const tierVariant: Record<string, "default" | "secondary" | "outline"> = {
  platinum: "default",
  gold: "secondary",
  silver: "outline",
  regular: "outline",
}

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name", header: "Nama",
    cell: ({ row }) => (
      <Link href={`/dashboard/customers/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "phone", header: "Telepon", cell: ({ row }) => row.original.phone || "-" },
  {
    accessorKey: "tier", header: "Tier",
    cell: ({ row }) => (
      <Badge variant={tierVariant[row.original.tier] ?? "outline"} className="capitalize">
        {row.original.tier}
      </Badge>
    ),
  },
  { accessorKey: "totalSpent", header: "Total Belanja", cell: ({ row }) => formatRupiah(row.original.totalSpent) },
  { accessorKey: "_count.transactions", header: "Transaksi", cell: ({ row }) => row.original._count.transactions },
]

export function CustomersTable({ customers }: { customers: Customer[] }) {
  return (
    <div data-tour="customer-table">
      <DataTable columns={columns} data={customers} searchKey="name" searchPlaceholder="Cari pelanggan..." searchTourId="customer-search" />
    </div>
  )
}
