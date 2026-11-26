"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { adjustStock } from "@/lib/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

const schema = z.object({
  productId: z.string().min(1, "Pilih produk"),
  type:      z.enum(["in", "out", "adjustment"]),
  quantity:  z.coerce.number().int().min(1, "Jumlah minimal 1"),
  note:      z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

export function StockAdjustmentForm({ products }: { products: { id: string; name: string; stock: number; unit: string }[] }) {
  const router = useRouter()
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { productId: "", type: "in", quantity: 1, note: "" },
  })

  async function onSubmit(data: FormValues) {
    try {
      await adjustStock({
        productId: data.productId,
        type:      data.type,
        quantity:  data.quantity,
        note:      data.note || undefined,
      })
      toast.success("Stok disesuaikan")
      router.push("/dashboard/inventory")
    } catch {
      toast.error("Gagal menyesuaikan stok")
    }
  }

  return (
    <Card className="max-w-xl">
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Produk</Label>
            <Controller name="productId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} (Stok: {p.stock} {p.unit})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
            <FieldError msg={errors.productId?.message} />
          </div>

          <div className="space-y-2">
            <Label>Tipe</Label>
            <Controller name="type" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Masuk (Tambah)</SelectItem>
                  <SelectItem value="out">Keluar (Kurang)</SelectItem>
                  <SelectItem value="adjustment">Penyesuaian</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Jumlah</Label>
            <Input id="quantity" type="number" min="1" {...register("quantity")} />
            <FieldError msg={errors.quantity?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Catatan</Label>
            <Input id="note" {...register("note")} placeholder="Catatan (opsional)" />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
