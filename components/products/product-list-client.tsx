"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { type ColumnDef } from "@/components/ui/data-table"
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions"
import { PageTitle } from "@/components/ui/page-title"
import { toast } from "sonner"
import { formatRupiah } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DataTable } from "@/components/ui/data-table"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { PriceInput } from "@/components/ui/price-input"

type Category = { id: string; name: string }
type Product = {
  id: string; name: string; sku: string; barcode: string | null
  categoryId: string; price: number; costPrice: number
  stock: number; minStock: number; unit: string; isActive: boolean
  category: { name: string }
}

const schema = z.object({
  name:       z.string().min(1, "Nama wajib diisi"),
  sku:        z.string().min(1, "SKU wajib diisi"),
  barcode:    z.string().optional(),
  categoryId: z.string().min(1, "Pilih kategori"),
  price:      z.number().min(1, "Harga > 0"),
  costPrice:  z.number().min(0),
  stock:      z.coerce.number().int().min(0),
  minStock:   z.coerce.number().int().min(0),
  unit:       z.enum(["pcs", "kg", "liter"]),
})
type FormValues = z.infer<typeof schema>

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

function ProductDialog({ open, onOpenChange, product, categories }: {
  open: boolean; onOpenChange: (v: boolean) => void; product?: Product; categories: Category[]
}) {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:       product?.name ?? "",
      sku:        product?.sku ?? "",
      barcode:    product?.barcode ?? "",
      categoryId: product?.categoryId ?? "",
      price:      product ? product.price / 100 : 0,
      costPrice:  product ? product.costPrice / 100 : 0,
      stock:      product?.stock ?? 0,
      minStock:   product?.minStock ?? 5,
      unit:       (product?.unit as "pcs" | "kg" | "liter") ?? "pcs",
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      const payload = { ...data, price: Math.round(data.price * 100), costPrice: Math.round(data.costPrice * 100), barcode: data.barcode || undefined }
      if (product) { await updateProduct(product.id, payload); toast.success("Produk diperbarui") }
      else { await createProduct(payload); toast.success("Produk ditambahkan") }
      reset()
      onOpenChange(false)
    } catch { toast.error("Gagal menyimpan produk") }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{product ? "Edit Produk" : "Tambah Produk"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Produk</Label>
            <Input {...register("name")} />
            <FieldError msg={errors.name?.message} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input {...register("sku")} />
              <FieldError msg={errors.sku?.message} />
            </div>
            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input {...register("barcode")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Controller name="categoryId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Pilih kategori">{categories.find(c => c.id === field.value)?.name}</SelectValue></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            )} />
            <FieldError msg={errors.categoryId?.message} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Harga Jual</Label>
              <Controller name="price" control={control} render={({ field }) => (
                <PriceInput value={field.value} onChange={field.onChange} />
              )} />
              <FieldError msg={errors.price?.message} />
            </div>
            <div className="space-y-2">
              <Label>Harga Modal</Label>
              <Controller name="costPrice" control={control} render={({ field }) => (
                <PriceInput value={field.value} onChange={field.onChange} />
              )} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Stok</Label>
              <Input type="number" {...register("stock")} />
            </div>
            <div className="space-y-2">
              <Label>Min. Stok</Label>
              <Input type="number" {...register("minStock")} />
            </div>
            <div className="space-y-2">
              <Label>Satuan</Label>
              <Controller name="unit" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue>{{ pcs: "Pcs", kg: "Kg", liter: "Liter" }[field.value]}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pcs</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProductListClient({ products, categories }: {
  products: Product[]; categories: Category[]; query?: string
}) {
  const [addOpen, setAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function handleDelete() {
    if (!deleteId) return
    await deleteProduct(deleteId)
    toast.success("Produk dihapus")
    setDeleteId(null)
  }

  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Nama", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "sku", header: "SKU", cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku}</span> },
    { accessorKey: "category.name", header: "Kategori" },
    { accessorKey: "price", header: "Harga", cell: ({ row }) => formatRupiah(row.original.price) },
    {
      accessorKey: "stock", header: "Stok",
      cell: ({ row }) => {
        const p = row.original
        return p.stock <= p.minStock
          ? <Badge variant="destructive">{p.stock} {p.unit}</Badge>
          : <span>{p.stock} {p.unit}</span>
      },
    },
    {
      id: "actions", header: "Aksi", size: 80,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-xs" onClick={() => setEditProduct(row.original)}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon-xs" onClick={() => setDeleteId(row.original.id)}><Trash2 className="size-4 text-muted-foreground" /></Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle title="Produk" description="Daftar semua produk aktif. Tambah, edit, atau nonaktifkan produk dan atur stok minimum." />
        <Button data-tour="add-product-btn" onClick={() => setAddOpen(true)}><Plus className="size-4" /> Tambah Produk</Button>
      </div>

      <ProductDialog open={addOpen} onOpenChange={setAddOpen} categories={categories} />
      {editProduct && <ProductDialog open onOpenChange={(v) => !v && setEditProduct(null)} product={editProduct} categories={categories} />}

      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Produk</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Yakin ingin menghapus produk ini?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div data-tour="product-table">
        <DataTable columns={columns} data={products} searchKey="name" searchPlaceholder="Cari produk..." searchTourId="product-search" />
      </div>
    </div>
  )
}
