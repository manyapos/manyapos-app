"use client"

import Link from "next/link"
import { deleteProduct } from "@/lib/actions"
import { toast } from "sonner"
import { Pencil, Trash2 } from "lucide-react"

export function ProductActions({ id }: { id: string }) {
  return (
    <div className="flex gap-1">
      <Link
        href={`/dashboard/products/${id}`}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Pencil className="size-4" />
      </Link>
      <button
        onClick={async () => {
          if (!confirm("Yakin ingin menghapus produk ini?")) return
          await deleteProduct(id)
          toast.success("Produk dihapus")
        }}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}
