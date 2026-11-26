"use client"

import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createProduct, updateProduct } from "@/lib/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { FieldHint } from "@/components/ui/page-title"
import { PriceInput } from "@/components/ui/price-input"

const schema = z.object({
  name:       z.string().min(1, "Nama wajib diisi"),
  sku:        z.string().min(1, "SKU wajib diisi"),
  barcode:    z.string().optional(),
  categoryId: z.string().min(1, "Pilih kategori"),
  price:      z.number({ invalid_type_error: "Harga wajib diisi" }).min(1, "Harga > 0"),
  costPrice:  z.number({ invalid_type_error: "Harga modal wajib diisi" }).min(0),
  stock:      z.coerce.number().int().min(0),
  minStock:   z.coerce.number().int().min(0),
  unit:       z.enum(["pcs", "kg", "liter"]),
})
type FormValues = z.infer<typeof schema>

type Category = { id: string; name: string }
type Product = {
  id: string; name: string; sku: string; barcode: string | null
  categoryId: string; price: number; costPrice: number
  stock: number; minStock: number; unit: string
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter()
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
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
      const payload = {
        ...data,
        price:     Math.round(data.price * 100),
        costPrice: Math.round(data.costPrice * 100),
        barcode:   data.barcode || undefined,
      }
      if (product) {
        await updateProduct(product.id, payload)
        toast.success("Produk diperbarui")
      } else {
        await createProduct(payload)
        toast.success("Produk ditambahkan")
      }
      router.push("/dashboard/products")
    } catch {
      toast.error("Gagal menyimpan produk")
    }
  }

  return (
    <Card className="max-w-xl">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2" data-tour="product-name">
            <Label htmlFor="name">Nama Produk</Label>
            <Input id="name" {...register("name")} />
            <FieldError msg={errors.name?.message} />
          </div>

          <div className="space-y-2" data-tour="product-sku">
            <div className="flex items-center gap-1">
              <Label htmlFor="sku">SKU</Label>
              <FieldHint text="Stock Keeping Unit — kode unik internal untuk identifikasi produk. Contoh: KOPI-001" />
            </div>
            <Input id="sku" {...register("sku")} />
            <FieldError msg={errors.sku?.message} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="barcode">Barcode</Label>
              <FieldHint text="Nomor barcode produk (opsional). Digunakan untuk scan produk di POS menggunakan kamera atau barcode scanner." />
            </div>
            <Input id="barcode" {...register("barcode")} />
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Controller name="categoryId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            <FieldError msg={errors.categoryId?.message} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" data-tour="product-price">
            <div className="space-y-2">
              <Label htmlFor="price">Harga Jual</Label>
              <Controller name="price" control={control} render={({ field }) => (
                <PriceInput value={field.value} onChange={field.onChange} />
              )} />
              <FieldError msg={errors.price?.message} />
            </div>
            <div className="space-y-2" data-tour="product-cost">
              <div className="flex items-center gap-1">
                <Label htmlFor="costPrice">Harga Modal</Label>
                <FieldHint text="Harga beli / harga pokok produk. Digunakan untuk menghitung laba kotor di laporan. Tidak ditampilkan ke pelanggan." />
              </div>
              <Controller name="costPrice" control={control} render={({ field }) => (
                <PriceInput value={field.value} onChange={field.onChange} />
              )} />
              <FieldError msg={errors.costPrice?.message} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" data-tour="product-stock">
            <div className="space-y-2">
              <Label htmlFor="stock">Stok</Label>
              <Input id="stock" type="number" {...register("stock")} />
              <FieldError msg={errors.stock?.message} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="minStock">Min. Stok</Label>
                <FieldHint text="Batas minimum stok. Sistem akan mengirim peringatan stok rendah ketika jumlah stok mencapai atau di bawah angka ini." />
              </div>
              <Input id="minStock" type="number" {...register("minStock")} />
              <FieldError msg={errors.minStock?.message} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label>Satuan</Label>
                <FieldHint text="Satuan ukuran produk. Pcs = per buah, Kg = per kilogram, Liter = per liter." />
              </div>
              <Controller name="unit" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pcs</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : product ? "Simpan" : "Tambah"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
