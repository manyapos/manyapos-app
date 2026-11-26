"use client"

import { type ColumnDef } from "@/components/ui/data-table"
import { DataTable } from "@/components/ui/data-table"
import { formatRupiah, formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type Shift = {
  id: string
  user: { name: string }
  startTime: Date
  endTime: Date | null
  openingBalance: number
  totalSales: number
  totalTransactions: number
  status: string
}

const columns: ColumnDef<Shift>[] = [
  { accessorKey: "user.name", header: "Kasir", cell: ({ row }) => <span className="font-medium">{row.original.user.name}</span> },
  { accessorKey: "startTime", header: "Mulai", cell: ({ row }) => <span className="text-sm">{formatDate(row.original.startTime)}</span> },
  { accessorKey: "endTime", header: "Selesai", cell: ({ row }) => <span className="text-sm">{row.original.endTime ? formatDate(row.original.endTime) : "—"}</span> },
  { accessorKey: "openingBalance", header: "Saldo Awal", cell: ({ row }) => formatRupiah(row.original.openingBalance) },
  { accessorKey: "totalSales", header: "Total Penjualan", cell: ({ row }) => formatRupiah(row.original.totalSales) },
  { accessorKey: "totalTransactions", header: "Transaksi" },
  {
    accessorKey: "status", header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "open" ? "default" : "secondary"}>
        {row.original.status === "open" ? "Aktif" : "Selesai"}
      </Badge>
    ),
  },
  {
    id: "actions", size: 60,
    cell: ({ row }) => (
      <Link href={`/dashboard/shifts/${row.original.id}`} className="text-sm text-primary hover:underline">Detail</Link>
    ),
  },
]

export function ShiftsTable({ shifts }: { shifts: Shift[] }) {
  return <DataTable columns={columns} data={shifts} searchKey="user.name" searchPlaceholder="Cari kasir..." />
}
