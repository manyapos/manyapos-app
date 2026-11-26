"use client"

import { useCartStore } from "@/lib/cart-store"
import { formatRupiah } from "@/lib/format"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Trash2, RotateCcw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

export function HeldOrdersSheet() {
  const { heldOrders, recallOrder, deleteHeldOrder } = useCartStore()

  if (heldOrders.length === 0) return null

  return (
    <Sheet>
      <SheetTrigger
        className="relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-xs hover:bg-muted transition-all"
        data-tour="held-orders-btn"
      >
        <Clock className="size-4" />
        <span className="hidden sm:inline">Parkir</span>
        <Badge className="absolute -right-2 -top-2 size-5 rounded-full p-0 flex items-center justify-center text-[10px]">
          {heldOrders.length}
        </Badge>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Order Diparkirkan ({heldOrders.length})</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          {heldOrders.map(order => (
            <div key={order.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{order.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} item · {formatRupiah(order.items.reduce((s, i) => s + i.price * i.quantity, 0))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(order.heldAt, { addSuffix: true, locale: id })}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="size-7" onClick={() => recallOrder(order.id)} title="Recall">
                    <RotateCcw className="size-3.5 text-primary" />
                  </Button>
                  <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => deleteHeldOrder(order.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 space-y-0.5">
                {order.items.map(i => (
                  <p key={i.productId} className="text-xs text-muted-foreground">
                    {i.name} ×{i.quantity}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
