"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createExpense } from "@/lib/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { PriceInput } from "@/components/ui/price-input"
import { useState } from "react"

const expenseCategories = ["Bahan Baku", "Operasional", "Gaji", "Sewa", "Listrik & Air", "Lainnya"]

const schema = z.object({
  category:    z.string().min(1),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  amount:      z.number({ invalid_type_error: "Jumlah wajib diisi" }).min(1, "Jumlah > 0"),
  date:        z.string().min(1, "Tanggal wajib diisi"),
})
type FormValues = z.infer<typeof schema>

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

export function ExpenseActions() {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category:    expenseCategories[0],
      description: "",
      amount:      0,
      date:        new Date().toISOString().slice(0, 10),
    },
  })

  async function onSubmit(data: FormValues) {
    await createExpense({
      category:    data.category,
      description: data.description,
      amount:      Math.round(data.amount * 100),
      date:        new Date(data.date),
    })
    toast.success("Pengeluaran ditambahkan")
    reset()
    setOpen(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="size-4" /> Tambah Pengeluaran</Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Pengeluaran</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Controller name="category" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input {...register("description")} placeholder="Deskripsi" />
              <FieldError msg={errors.description?.message} />
            </div>
            <div className="space-y-2">
              <Label>Jumlah (Rp)</Label>
              <Controller name="amount" control={control} render={({ field }) => (
                <PriceInput value={field.value} onChange={field.onChange} placeholder="0" />
              )} />
              <FieldError msg={errors.amount?.message} />
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input {...register("date")} type="date" />
              <FieldError msg={errors.date?.message} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
