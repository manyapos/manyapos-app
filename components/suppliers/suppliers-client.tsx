"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { createSupplier, updateSupplier, deleteSupplier } from "@/lib/actions"
import { PageTitle } from "@/components/ui/page-title"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"

type Supplier = { id: string; name: string; phone: string | null; email: string | null; address: string | null; notes: string | null }

const schema = z.object({
  name:    z.string().min(1, "Nama wajib diisi"),
  phone:   z.string().optional(),
  email:   z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
  notes:   z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

function SupplierForm({ defaultValues, onSubmit, submitLabel }: {
  defaultValues: FormValues
  onSubmit: (data: FormValues) => Promise<void>
  submitLabel: string
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema), defaultValues,
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2"><Label>Nama Supplier</Label><Input {...register("name")} /><FieldError msg={errors.name?.message} /></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Telepon</Label><Input {...register("phone")} /></div>
        <div className="space-y-2"><Label>Email</Label><Input {...register("email")} type="email" /><FieldError msg={errors.email?.message} /></div>
      </div>
      <div className="space-y-2"><Label>Alamat</Label><Input {...register("address")} /></div>
      <div className="space-y-2"><Label>Catatan</Label><Input {...register("notes")} /></div>
      <DialogFooter><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : submitLabel}</Button></DialogFooter>
    </form>
  )
}

export function SuppliersClient({ suppliers }: { suppliers: Supplier[] }) {
  const [addOpen, setAddOpen]   = useState(false)
  const [editItem, setEditItem] = useState<Supplier | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleAdd(data: FormValues) {
    await createSupplier({ ...data, phone: data.phone || undefined, email: data.email || undefined, address: data.address || undefined, notes: data.notes || undefined })
    toast.success("Supplier ditambahkan"); setAddOpen(false)
  }
  async function handleUpdate(data: FormValues) {
    if (!editItem) return
    await updateSupplier(editItem.id, { ...data, phone: data.phone || undefined, email: data.email || undefined })
    toast.success("Supplier diperbarui"); setEditItem(null)
  }
  async function handleDelete() {
    if (!deleteId) return
    try { await deleteSupplier(deleteId); toast.success("Supplier dihapus") }
    catch { toast.error("Tidak bisa menghapus, masih ada PO terkait") }
    setDeleteId(null)
  }

  const columns: ColumnDef<Supplier>[] = [
    { accessorKey: "name", header: "Nama", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "phone", header: "Telepon", cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone || "—"}</span> },
    { accessorKey: "email", header: "Email", cell: ({ row }) => <span className="text-muted-foreground">{row.original.email || "—"}</span> },
    { accessorKey: "address", header: "Alamat", cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.address || "—"}</span> },
    {
      id: "actions", header: "Aksi", size: 80,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={() => setEditItem(row.original)}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon-xs" onClick={() => setDeleteId(row.original.id)}><Trash2 className="size-4 text-muted-foreground" /></Button>
        </div>
      ),
    },
  ]

  const empty: FormValues = { name: "", phone: "", email: "", address: "", notes: "" }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle title="Supplier" description="Kelola daftar supplier untuk pembelian stok produk." />
        <Button data-tour="add-supplier-btn" onClick={() => setAddOpen(true)}><Plus className="size-4" /> Tambah Supplier</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent><DialogHeader><DialogTitle>Tambah Supplier</DialogTitle></DialogHeader>
          <SupplierForm defaultValues={empty} onSubmit={handleAdd} submitLabel="Simpan" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent><DialogHeader><DialogTitle>Edit Supplier</DialogTitle></DialogHeader>
          {editItem && <SupplierForm
            defaultValues={{ name: editItem.name, phone: editItem.phone ?? "", email: editItem.email ?? "", address: editItem.address ?? "", notes: editItem.notes ?? "" }}
            onSubmit={handleUpdate} submitLabel="Simpan"
          />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent><DialogHeader><DialogTitle>Hapus Supplier</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Yakin ingin menghapus supplier ini?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div data-tour="supplier-table">
        <DataTable columns={columns} data={suppliers} searchKey="name" searchPlaceholder="Cari supplier..." />
      </div>
    </div>
  )
}
