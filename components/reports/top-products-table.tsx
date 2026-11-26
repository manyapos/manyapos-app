"use client"

import { type ColumnDef } from "@/components/ui/data-table"
import { DataTable } from "@/components/ui/data-table"
import { formatRupiah } from "@/lib/format"

type TopProduct = { name: string; quantity: number; revenue: number }

const columns: ColumnDef<TopProduct>[] = [
  {
    id: "rank",
    header: "#",
    cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
  },
  { accessorKey: "name", header: "Produk", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: "quantity", header: "Terjual" },
  { accessorKey: "revenue", header: "Pendapatan", cell: ({ row }) => formatRupiah(row.original.revenue) },
]

export function TopProductsTable({ products }: { products: TopProduct[] }) {
  return <DataTable columns={columns} data={products} searchKey="name" searchPlaceholder="Cari produk..." pageSize={10} />
}
