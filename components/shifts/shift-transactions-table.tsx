"use client"

import { type ColumnDef } from "@/components/ui/data-table"
import { DataTable } from "@/components/ui/data-table"
import { formatRupiah, formatDate } from "@/lib/format"

type ShiftTransaction = {
  id: string
  invoiceNumber: string
  createdAt: Date
  paymentMethod: string
  total: number
}

const columns: ColumnDef<ShiftTransaction>[] = [
  { accessorKey: "invoiceNumber", header: "Invoice", cell: ({ row }) => <span className="font-mono text-xs">{row.original.invoiceNumber}</span> },
  { accessorKey: "createdAt", header: "Waktu", cell: ({ row }) => <span className="text-sm">{formatDate(row.original.createdAt)}</span> },
  { accessorKey: "paymentMethod", header: "Pembayaran", cell: ({ row }) => <span className="capitalize">{row.original.paymentMethod}</span> },
  { accessorKey: "total", header: "Total", cell: ({ row }) => <span className="font-medium">{formatRupiah(row.original.total)}</span> },
]

export function ShiftTransactionsTable({ transactions }: { transactions: ShiftTransaction[] }) {
  return <DataTable columns={columns} data={transactions} searchKey="invoiceNumber" searchPlaceholder="Cari invoice..." />
}
