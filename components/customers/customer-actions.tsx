"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createCustomer } from "@/lib/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useState } from "react"

const schema = z.object({
  name:    z.string().min(1, "Nama wajib diisi"),
  phone:   z.string().optional(),
  email:   z.string().email("Format email tidak valid").optional().or(z.literal("")),
  address: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

export function CustomerActions() {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", address: "" },
  })

  async function onSubmit(data: FormValues) {
    await createCustomer({
      name:    data.name,
      phone:   data.phone   || undefined,
      email:   data.email   || undefined,
      address: data.address || undefined,
    })
    toast.success("Pelanggan ditambahkan")
    reset()
    setOpen(false)
  }

  return (
    <>
      <Button data-tour="add-customer-btn" onClick={() => setOpen(true)}><Plus className="size-4" /> Tambah Pelanggan</Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Pelanggan</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input {...register("name")} placeholder="Nama pelanggan" />
              <FieldError msg={errors.name?.message} />
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input {...register("phone")} placeholder="Nomor telepon" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...register("email")} type="email" placeholder="Email (opsional)" />
              <FieldError msg={errors.email?.message} />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input {...register("address")} placeholder="Alamat (opsional)" />
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
