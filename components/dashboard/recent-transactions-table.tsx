"use client"

import { type ColumnDef } from "@/components/ui/data-table"
import { DataTable } from "@/components/ui/data-table"
import { formatRupiah } from "@/lib/format"
import { Badge } from "@/components/ui/badge"

type RecentTx = {
  id: string
  invoiceNumber: string
  user: { name: string }
  total: number
  paymentMethod: string
  status: string
}

const columns: ColumnDef<RecentTx>[] = [
  { accessorKey: "invoiceNumber", header: "Invoice", cell: ({ row }) => <span className="font-mono text-xs">{row.original.invoiceNumber}</span> },
  { accessorKey: "user.name", header: "Kasir", cell: ({ row }) => row.original.user.name },
  { accessorKey: "total", header: "Total", cell: ({ row }) => formatRupiah(row.original.total) },
  { accessorKey: "paymentMethod", header: "Metode", cell: ({ row }) => <span className="capitalize">{row.original.paymentMethod}</span> },
  {
    accessorKey: "status", header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "completed" ? "default" : "destructive"}>{row.original.status}</Badge>
    ),
  },
]

export function RecentTransactionsTable({ transactions }: { transactions: RecentTx[] }) {
  return <DataTable columns={columns} data={transactions} pageSize={5} />
}
