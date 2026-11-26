"use client"

import { type ColumnDef } from "@/components/ui/data-table"
import { DataTable } from "@/components/ui/data-table"
import { formatRupiah, formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { VoidButton } from "@/components/transactions/void-button"
import { ExportCSVButton } from "@/components/ui/export-csv-button"
import Link from "next/link"

type Transaction = {
  id: string
  invoiceNumber: string
  createdAt: Date
  user: { name: string }
  customer: { name: string } | null
  total: number
  paymentMethod: string
  status: string
}

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "invoiceNumber", header: "Invoice",
    cell: ({ row }) => (
      <Link href={`/dashboard/transactions/${row.original.id}`} className="font-mono text-xs text-primary hover:underline">
        {row.original.invoiceNumber}
      </Link>
    ),
  },
  { accessorKey: "createdAt", header: "Tanggal", cell: ({ row }) => <span className="text-xs">{formatDate(row.original.createdAt)}</span> },
  { accessorKey: "user.name", header: "Kasir", cell: ({ row }) => row.original.user.name },
  { accessorKey: "customer.name", header: "Pelanggan", cell: ({ row }) => row.original.customer?.name || "-" },
  { accessorKey: "total", header: "Total", cell: ({ row }) => <span className="font-medium">{formatRupiah(row.original.total)}</span> },
  { accessorKey: "paymentMethod", header: "Metode", cell: ({ row }) => <span className="capitalize">{row.original.paymentMethod}</span> },
  {
    accessorKey: "status", header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "completed" ? "default" : "destructive"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions", header: "Aksi", size: 80,
    cell: ({ row }) => row.original.status === "completed" ? <VoidButton id={row.original.id} /> : null,
  },
]

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  const csvRows = transactions.map(t => ({
    Invoice: t.invoiceNumber,
    Tanggal: formatDate(t.createdAt),
    Kasir: t.user.name,
    Pelanggan: t.customer?.name || "-",
    Total: t.total / 100,
    Metode: t.paymentMethod,
    Status: t.status,
  }))

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ExportCSVButton rows={csvRows} filename="transaksi" label="Export CSV" />
      </div>
      <DataTable columns={columns} data={transactions} searchKey="invoiceNumber" searchPlaceholder="Cari invoice..." searchTourId="transaction-search" />
    </div>
  )
}
