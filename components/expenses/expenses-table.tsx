"use client"

import { type ColumnDef } from "@/components/ui/data-table"
import { DataTable } from "@/components/ui/data-table"
import { formatRupiah, formatDate } from "@/lib/format"

type Expense = {
  id: string
  date: Date
  category: string
  description: string
  amount: number
  user: { name: string }
}

const columns: ColumnDef<Expense>[] = [
  { accessorKey: "date", header: "Tanggal", cell: ({ row }) => <span className="text-xs">{formatDate(row.original.date)}</span> },
  { accessorKey: "category", header: "Kategori" },
  { accessorKey: "description", header: "Deskripsi", cell: ({ row }) => <span className="text-muted-foreground">{row.original.description}</span> },
  { accessorKey: "amount", header: "Jumlah", cell: ({ row }) => <span className="font-medium">{formatRupiah(row.original.amount)}</span> },
  { accessorKey: "user.name", header: "Oleh", cell: ({ row }) => row.original.user.name },
]

export function ExpensesTable({ expenses }: { expenses: Expense[] }) {
  return <DataTable columns={columns} data={expenses} searchKey="description" searchPlaceholder="Cari pengeluaran..." />
}
