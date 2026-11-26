"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { type ColumnDef } from "@/components/ui/data-table"
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions"
import { PageTitle } from "@/components/ui/page-title"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

const schema = z.object({
  name:        z.string().min(1, "Nama wajib diisi"),
  description: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

type Category = { id: string; name: string; slug: string; description: string | null; productCount: number }

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

function CategoryForm({ defaultValues, onSubmit, submitLabel }: {
  defaultValues: FormValues
  onSubmit: (data: FormValues) => Promise<void>
  submitLabel: string
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Nama</Label>
        <Input {...register("name")} placeholder="Nama kategori" />
        <FieldError msg={errors.name?.message} />
      </div>
      <div className="space-y-2">
        <Label>Deskripsi</Label>
        <Input {...register("description")} placeholder="Deskripsi (opsional)" />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : submitLabel}</Button>
      </DialogFooter>
    </form>
  )
}

export function CategoryList({ categories }: { categories: Category[] }) {
  const [addOpen, setAddOpen] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleAdd(data: FormValues) {
    await createCategory({ name: data.name, slug: data.name.toLowerCase().replace(/\s+/g, "-"), description: data.description || undefined })
    toast.success("Kategori ditambahkan")
    setAddOpen(false)
  }

  async function handleUpdate(data: FormValues) {
    if (!editCat) return
    await updateCategory(editCat.id, { name: data.name, slug: data.name.toLowerCase().replace(/\s+/g, "-"), description: data.description || undefined })
    toast.success("Kategori diperbarui")
    setEditCat(null)
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteCategory(deleteId)
      toast.success("Kategori dihapus")
    } catch {
      toast.error("Tidak bisa menghapus, masih ada produk terkait")
    }
    setDeleteId(null)
  }

  const columns: ColumnDef<Category>[] = [
    { accessorKey: "name", header: "Nama", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "description", header: "Deskripsi", cell: ({ row }) => <span className="text-muted-foreground">{row.original.description || "-"}</span> },
    { accessorKey: "productCount", header: "Produk" },
    {
      id: "actions", header: "Aksi", size: 80,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={() => setEditCat(row.original)}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon-xs" onClick={() => setDeleteId(row.original.id)}><Trash2 className="size-4 text-muted-foreground hover:text-destructive" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle title="Kategori" description="Kelola kategori produk. Kategori membantu kasir menemukan produk lebih cepat di POS." />
        <Button data-tour="add-category-btn" onClick={() => setAddOpen(true)}><Plus className="size-4" /> Tambah Kategori</Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Kategori</DialogTitle></DialogHeader>
          <CategoryForm defaultValues={{ name: "", description: "" }} onSubmit={handleAdd} submitLabel="Simpan" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCat} onOpenChange={(o) => !o && setEditCat(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Kategori</DialogTitle></DialogHeader>
          {editCat && (
            <CategoryForm
              defaultValues={{ name: editCat.name, description: editCat.description ?? "" }}
              onSubmit={handleUpdate}
              submitLabel="Simpan"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Kategori</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Yakin ingin menghapus kategori ini? Aksi ini tidak bisa dibatalkan.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div data-tour="category-table">
        <DataTable columns={columns} data={categories} searchKey="name" searchPlaceholder="Cari kategori..." />
      </div>
    </div>
  )
}
