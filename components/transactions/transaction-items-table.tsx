"use client"

import { type ColumnDef } from "@/components/ui/data-table"
import { DataTable } from "@/components/ui/data-table"
import { formatRupiah } from "@/lib/format"

type TxItem = {
  id: string
  productName: string
  price: number
  quantity: number
  subtotal: number
  note?: string | null
}

const columns: ColumnDef<TxItem>[] = [
  { accessorKey: "productName", header: "Produk", cell: ({ row }) => (
    <div>
      <p className="font-medium">{row.original.productName}</p>
      {row.original.note && <p className="text-xs text-muted-foreground">{row.original.note}</p>}
    </div>
  )},
  { accessorKey: "price", header: "Harga", cell: ({ row }) => formatRupiah(row.original.price) },
  { accessorKey: "quantity", header: "Qty" },
  { accessorKey: "subtotal", header: "Subtotal", cell: ({ row }) => <span className="font-medium">{formatRupiah(row.original.subtotal)}</span> },
]

export function TransactionItemsTable({ items }: { items: TxItem[] }) {
  return <DataTable columns={columns} data={items} pageSize={50} />
}
