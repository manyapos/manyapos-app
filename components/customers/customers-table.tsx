"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { type ColumnDef, DataTable } from "@/components/ui/data-table"
import { updateCustomer, deleteCustomer } from "@/lib/actions"
import { formatRupiah } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

type Customer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
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

const schema = z.object({
  name:    z.string().min(1, "Nama wajib diisi"),
  phone:   z.string().optional(),
  email:   z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function openEdit(c: Customer) {
    setEditing(c)
    reset({ name: c.name, phone: c.phone || "", email: c.email || "", address: c.address || "" })
  }

  async function onSubmit(data: FormValues) {
    if (!editing) return
    try {
      await updateCustomer(editing.id, {
        name: data.name,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address || undefined,
      })
      toast.success("Pelanggan diperbarui")
      setEditing(null)
      router.refresh()
    } catch {
      toast.error("Gagal memperbarui pelanggan")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteCustomer(deleteTarget.id)
      toast.success("Pelanggan dihapus")
      setDeleteTarget(null)
      router.refresh()
    } catch {
      toast.error("Gagal menghapus pelanggan")
    }
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
    {
      id: "actions", header: "Aksi", size: 80,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={() => openEdit(row.original)} title="Edit">
            <Pencil className="size-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => setDeleteTarget(row.original)} title="Hapus">
            <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div data-tour="customer-table">
        <DataTable columns={columns} data={customers} searchKey="name" searchPlaceholder="Cari pelanggan..." searchTourId="customer-search" />
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) setEditing(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Pelanggan</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input {...register("name")} placeholder="Nama pelanggan" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input {...register("phone")} placeholder="Nomor telepon" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...register("email")} type="email" placeholder="Email (opsional)" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input {...register("address")} placeholder="Alamat (opsional)" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Perbarui"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Pelanggan</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus <span className="font-medium text-foreground">{deleteTarget?.name}</span>? Aksi ini tidak bisa dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
