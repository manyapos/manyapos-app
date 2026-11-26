"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createPurchaseOrder } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Controller } from "react-hook-form"
import { PriceInput } from "@/components/ui/price-input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"
import { formatRupiah } from "@/lib/format"

type Supplier = { id: string; name: string }
type Product = { id: string; name: string; costPrice: number; sku: string }

const itemSchema = z.object({
  productId:   z.string().min(1, "Pilih produk"),
  productName: z.string().min(1),
  quantity:    z.coerce.number().int().min(1, "Min 1"),
  costPrice:   z.number().min(0),
})
const schema = z.object({
  supplierId: z.string().min(1, "Pilih supplier"),
  note:       z.string().optional(),
  items:      z.array(itemSchema).min(1, "Tambah minimal 1 produk"),
})
type FormValues = z.infer<typeof schema>

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

export function NewPOForm({ suppliers, products }: { suppliers: Supplier[]; products: Product[] }) {
  const router = useRouter()
  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { supplierId: "", note: "", items: [] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: "items" })
  const items = watch("items")
  const total = items.reduce((s, i) => s + (i.quantity || 0) * (i.costPrice || 0), 0)

  function addProduct() {
    append({ productId: "", productName: "", quantity: 1, costPrice: 0 })
  }

  async function onSubmit(data: FormValues) {
    try {
      await createPurchaseOrder(data)
      toast.success("Purchase order dibuat")
      router.push("/dashboard/purchases")
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Informasi PO</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Controller control={control} name="supplierId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} data-tour="po-supplier">
                  <SelectTrigger><SelectValue placeholder="Pilih supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              <FieldError msg={errors.supplierId?.message} />
            </div>
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Input {...register("note")} placeholder="Opsional" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Item Produk</CardTitle>
          <Button type="button" variant="outline" size="sm" data-tour="po-add-item" onClick={addProduct}>
            <Plus className="size-4 mr-1" />Tambah Produk
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {errors.items?.root && <FieldError msg={errors.items.root.message} />}
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada produk. Klik "Tambah Produk".</p>
          )}
          {fields.map((field, idx) => (
            <div key={field.id} className="grid grid-cols-[1fr_100px_150px_32px] gap-2 items-start">
              <div>
                <Controller control={control} name={`items.${idx}.productId`} render={({ field: f }) => (
                  <Select value={f.value} onValueChange={(val) => {
                    f.onChange(val)
                    const product = products.find(p => p.id === val)
                    if (product) {
                      setValue(`items.${idx}.productName`, product.name)
                      setValue(`items.${idx}.costPrice`, product.costPrice)
                    }
                  }}>
                    <SelectTrigger><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
                <FieldError msg={errors.items?.[idx]?.productId?.message} />
              </div>
              <div>
                <Input {...register(`items.${idx}.quantity`)} type="number" min={1} placeholder="Qty" />
                <FieldError msg={errors.items?.[idx]?.quantity?.message} />
              </div>
              <div>
                <Controller control={control} name={`items.${idx}.costPrice`} render={({ field: f }) => (
                  <PriceInput value={f.value} onChange={f.onChange} placeholder="Harga modal" />
                )} />
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)} className="mt-0.5">
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))}

          {items.length > 0 && (
            <div className="flex justify-end pt-2 border-t">
              <span className="text-sm font-semibold">Total: {formatRupiah(total)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/purchases")}>Batal</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Buat PO"}</Button>
      </div>
    </form>
  )
}
