"use client"

import { type ColumnDef } from "@/components/ui/data-table"
import { DataTable } from "@/components/ui/data-table"
import { formatRupiah } from "@/lib/format"

type ExpenseCategory = { cat: string; amt: number; pct: string }

const columns: ColumnDef<ExpenseCategory>[] = [
  { accessorKey: "cat", header: "Kategori", cell: ({ row }) => <span className="font-medium">{row.original.cat}</span> },
  { accessorKey: "amt", header: "Jumlah", cell: ({ row }) => formatRupiah(row.original.amt) },
  { accessorKey: "pct", header: "%", cell: ({ row }) => <span className="text-muted-foreground">{row.original.pct}%</span> },
]

export function ExpenseCategoryTable({ data }: { data: ExpenseCategory[] }) {
  return <DataTable columns={columns} data={data} pageSize={20} />
}
