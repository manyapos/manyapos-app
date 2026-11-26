"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { voidTransaction } from "@/lib/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function VoidButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleVoid() {
    setLoading(true)
    try {
      await voidTransaction(id)
      toast.success("Transaksi di-void")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Gagal void transaksi (hanya admin)")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-destructive hover:underline">
        Void
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Void Transaksi</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin void transaksi ini? Stok akan dikembalikan dan transaksi tidak bisa diaktifkan kembali.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleVoid} disabled={loading}>
              {loading ? "Memproses..." : "Void Transaksi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
