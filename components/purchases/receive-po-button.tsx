"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { receivePurchaseOrder, updatePurchaseOrderStatus } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Item = { productId: string; productName: string; quantity: number; costPrice: number; subtotal: number }

export function ReceivePOButton({ poId, items, status }: { poId: string; items: Item[]; status: string }) {
  const router = useRouter()
  const [mode, setMode] = useState<"idle" | "receiving">("idle")
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(items.map(i => [i.productId, i.quantity]))
  )

  async function handleReceive() {
    try {
      await receivePurchaseOrder(poId, items.map(i => ({ productId: i.productId, quantity: quantities[i.productId] ?? i.quantity })))
      toast.success("PO diterima, stok diperbarui")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function handleUpdateStatus(newStatus: string) {
    try {
      await updatePurchaseOrderStatus(poId, newStatus)
      toast.success("Status diperbarui")
      router.refresh()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  if (status === "received" || status === "cancelled") return null

  if (mode === "receiving") {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium">Konfirmasi qty yang diterima:</p>
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.productId} className="flex items-center justify-between gap-4">
              <span className="text-sm flex-1">{item.productName}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Expected: {item.quantity}</span>
                <Input
                  type="number" min={0} className="w-20 h-8 text-sm"
                  value={quantities[item.productId] ?? item.quantity}
                  onChange={e => setQuantities(prev => ({ ...prev, [item.productId]: Number(e.target.value) }))}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMode("idle")}>Batal</Button>
          <Button size="sm" onClick={handleReceive}>Konfirmasi Terima</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "draft" && (
        <Button variant="outline" size="sm" onClick={() => handleUpdateStatus("ordered")}>Tandai Dipesan</Button>
      )}
      {(status === "draft" || status === "ordered") && (
        <>
          <Button size="sm" onClick={() => setMode("receiving")}>Terima Barang</Button>
          <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus("cancelled")}>Batalkan PO</Button>
        </>
      )}
    </div>
  )
}
