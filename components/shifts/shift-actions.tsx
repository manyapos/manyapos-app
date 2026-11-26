"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { openShift, closeShift } from "@/lib/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Play, Square } from "lucide-react"
import { formatRupiah } from "@/lib/format"
import { PriceInput } from "@/components/ui/price-input"
import { useState } from "react"

const openSchema = z.object({
  openingBalance: z.number().min(0),
  note:           z.string().optional(),
})
const closeSchema = z.object({
  closingBalance: z.number().min(0, "Saldo wajib diisi"),
  note:           z.string().optional(),
})
type OpenValues  = z.infer<typeof openSchema>
type CloseValues = z.infer<typeof closeSchema>

type Shift = { id: string; openingBalance: number; status: string; startTime: Date }

export function ShiftActions({ activeShift }: { activeShift: Shift | null }) {
  const [openDialog, setOpenDialog]   = useState(false)
  const [closeDialog, setCloseDialog] = useState(false)

  const openForm = useForm<OpenValues>({
    resolver: zodResolver(openSchema),
    defaultValues: { openingBalance: 0, note: "" },
  })
  const closeForm = useForm<CloseValues>({
    resolver: zodResolver(closeSchema),
    defaultValues: { closingBalance: 0, note: "" },
  })

  async function handleOpen(data: OpenValues) {
    try {
      await openShift({ openingBalance: Math.round(data.openingBalance * 100), note: data.note || undefined })
      toast.success("Shift dibuka")
      openForm.reset()
      setOpenDialog(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuka shift")
    }
  }

  async function handleClose(data: CloseValues) {
    if (!activeShift) return
    try {
      await closeShift(activeShift.id, { closingBalance: Math.round(data.closingBalance * 100), note: data.note || undefined })
      toast.success("Shift ditutup")
      closeForm.reset()
      setCloseDialog(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menutup shift")
    }
  }

  return (
    <div className="flex items-center gap-3">
      {activeShift && (
        <Badge variant="default" className="gap-1">
          <span className="size-2 rounded-full bg-green-400 animate-pulse" />
          Shift Aktif · {formatRupiah(activeShift.openingBalance)}
        </Badge>
      )}

      {!activeShift ? (
        <Button onClick={() => setOpenDialog(true)}><Play className="size-4" /> Buka Shift</Button>
      ) : (
        <Button variant="outline" onClick={() => setCloseDialog(true)}><Square className="size-4" /> Tutup Shift</Button>
      )}

      {/* Buka Shift Dialog */}
      <Dialog open={openDialog} onOpenChange={(o) => { setOpenDialog(o); if (!o) openForm.reset() }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Buka Shift</DialogTitle></DialogHeader>
          <form onSubmit={openForm.handleSubmit(handleOpen)} className="space-y-4">
            <div className="space-y-2">
              <Label>Saldo Kas Awal (Rp)</Label>
              <Controller name="openingBalance" control={openForm.control} render={({ field }) => (
                <PriceInput value={field.value} onChange={field.onChange} placeholder="0" />
              )} />
            </div>
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Input {...openForm.register("note")} placeholder="Catatan shift" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={openForm.formState.isSubmitting}>
                {openForm.formState.isSubmitting ? "Membuka..." : "Buka Shift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tutup Shift Dialog */}
      <Dialog open={closeDialog} onOpenChange={(o) => { setCloseDialog(o); if (!o) closeForm.reset() }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tutup Shift</DialogTitle></DialogHeader>
          <form onSubmit={closeForm.handleSubmit(handleClose)} className="space-y-4">
            <div className="space-y-2">
              <Label>Saldo Kas Aktual (Rp)</Label>
              <Controller name="closingBalance" control={closeForm.control} render={({ field }) => (
                <PriceInput value={field.value} onChange={field.onChange} placeholder="0" />
              )} />
              <p className="text-xs text-muted-foreground">Hitung total uang tunai di laci kasir sekarang</p>
            </div>
            <div className="space-y-2">
              <Label>Catatan (opsional)</Label>
              <Input {...closeForm.register("note")} placeholder="Catatan penutupan" />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setCloseDialog(false)}>Batal</Button>
              <Button type="submit" disabled={closeForm.formState.isSubmitting}>
                {closeForm.formState.isSubmitting ? "Menutup..." : "Tutup Shift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
