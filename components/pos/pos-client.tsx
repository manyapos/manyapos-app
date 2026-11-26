"use client"

import { useState, useMemo, useRef } from "react"
import { useCartStore } from "@/lib/cart-store"
import { createTransaction } from "@/lib/actions"
import { formatRupiah } from "@/lib/format"
import { toast } from "sonner"
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  ChevronRight,
  PauseCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { PaymentModal } from "@/components/pos/payment-modal"
import { HeldOrdersSheet } from "@/components/pos/held-orders"

type Product = {
  id: string
  name: string
  sku: string
  barcode: string | null
  price: number
  stock: number
  unit: string
  image: string | null
  category: { id: string; name: string }
}

type Category = { id: string; name: string }
type Customer = { id: string; name: string; phone: string | null }

export function POSClient({
  products,
  categories,
  customers,
  taxRate,
}: {
  products: Product[]
  categories: Category[]
  customers: Customer[]
  taxRate: number
}) {
  const cart = useCartStore()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const catRef = useRef<HTMLDivElement>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [showMobileCart, setShowMobileCart] = useState(false)

  const filtered = useMemo(() => {
    let list = products
    if (categoryFilter)
      list = list.filter((p) => p.category.id === categoryFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcode?.includes(q)
      )
    }
    return list
  }, [products, categoryFilter, search])

  async function handlePayment(method: string, amountPaid: number) {
    const sub = cart.subtotal()
    const discountAmt = cart.discountAmount()
    const tax = cart.taxAmount(taxRate)
    const total = cart.total(taxRate)

    try {
      await createTransaction({
        items: cart.items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          quantity: i.quantity,
          price: i.price,
          discount: i.discount,
          subtotal: (i.price - i.discount) * i.quantity,
        })),
        subtotal: sub,
        discount: discountAmt,
        discountType: cart.discountType,
        tax,
        total,
        paymentMethod: method,
        amountPaid,
        change: amountPaid - total,
        customerId: cart.customerId || undefined,
        note: cart.note || undefined,
      })
      toast.success("Transaksi berhasil!")
      cart.clear()
      setShowPayment(false)
    } catch {
      toast.error("Gagal membuat transaksi")
    }
  }

  const total = cart.total(taxRate)
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0)

  // suppress unused warning — customers available for future customer selector feature
  void customers

  return (
    <div className="flex h-[calc(100dvh-3rem)] flex-col">
      {/* ── Top bar: Search + category pills ── */}
      <div className="flex items-center gap-2 border-b bg-background px-4 py-2">
        <div className="relative flex-1" data-tour="product-search">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari produk, SKU, atau scan barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 border-0 bg-muted/50 pl-9 focus-visible:bg-background focus-visible:ring-1"
          />
        </div>
        <HeldOrdersSheet />
      </div>
      <div
        ref={catRef}
        className="flex scrollbar-none gap-1.5 overflow-x-auto border-b bg-background px-4 py-2 cursor-grab active:cursor-grabbing select-none"
        data-tour="category-tabs"
        onMouseDown={(e) => {
          const el = catRef.current!
          const startX = e.pageX, startScroll = el.scrollLeft
          let moved = false
          const onMove = (ev: MouseEvent) => { moved = true; el.scrollLeft = startScroll - (ev.pageX - startX) }
          const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); if (moved) { el.addEventListener("click", (ev) => ev.stopPropagation(), { once: true, capture: true }) } }
          document.addEventListener("mousemove", onMove)
          document.addEventListener("mouseup", onUp)
        }}
      >
        <button
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !categoryFilter
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setCategoryFilter(null)}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === c.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setCategoryFilter(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* ── Main area: products + cart side by side ── */}
      <div className="flex min-h-0 flex-1">
        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Search className="size-8 opacity-30" />
              <p className="text-sm">Produk tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {filtered.map((p) => {
                const outOfStock = p.stock <= 0
                const inCart = cart.items.find((i) => i.productId === p.id)
                return (
                  <button
                    key={p.id}
                    disabled={outOfStock}
                    onClick={() => {
                      if (outOfStock) return toast.error("Stok habis!")
                      cart.addItem({ id: p.id, name: p.name, price: p.price })
                    }}
                    className={`group relative flex min-h-[90px] flex-col rounded-xl border bg-background p-3 text-left transition-all ${
                      outOfStock
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:border-primary/50 hover:shadow-sm active:scale-[0.98]"
                    } ${inCart ? "border-primary/40 ring-1 ring-primary/20" : ""} `}
                  >
                    <p className="line-clamp-2 text-sm leading-snug font-semibold">
                      {p.name}
                    </p>
                    <p className="mt-auto pt-2 text-sm font-bold text-primary">
                      {formatRupiah(p.price)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {outOfStock ? "Habis" : `Stok: ${p.stock} ${p.unit}`}
                    </p>

                    {inCart && (
                      <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {inCart.quantity}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Right: Cart panel — hidden on mobile, shown as Sheet ── */}
        <div
          className="hidden w-80 flex-col border-l bg-background sm:flex lg:w-96"
          data-tour="cart"
        >
          {/* Cart header */}
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <ShoppingCart className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Pesanan</span>
            {itemCount > 0 && (
              <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
            {cart.items.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 size-7"
                title="Parkir order"
                onClick={() => {
                  cart.holdOrder()
                  toast.info("Order diparkirkan")
                }}
              >
                <PauseCircle className="size-4 text-muted-foreground" />
              </Button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ShoppingCart className="size-8 opacity-20" />
                <p className="text-xs">Keranjang kosong</p>
              </div>
            ) : (
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-2 px-4 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                    {/* Qty stepper */}
                    <div className="flex items-center gap-1">
                      <button
                        className="flex size-6 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        onClick={() =>
                          cart.updateQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        className="flex size-6 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        onClick={() =>
                          cart.updateQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <div className="flex w-16 flex-col items-end">
                      <span className="text-xs font-semibold">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                      <button
                        className="text-[10px] text-muted-foreground transition-colors hover:text-destructive"
                        onClick={() => cart.removeItem(item.productId)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary & pay */}
          <div className="border-t bg-muted/20 p-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">
                  {formatRupiah(cart.subtotal())}
                </span>
              </div>
              {cart.discountAmount() > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon</span>
                  <span>−{formatRupiah(cart.discountAmount())}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Pajak ({taxRate}%)</span>
                  <span className="text-foreground">
                    {formatRupiah(cart.taxAmount(taxRate))}
                  </span>
                </div>
              )}
            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                  Total
                </p>
                <p className="text-xl font-bold">{formatRupiah(total)}</p>
              </div>
              <Button
                size="lg"
                className="gap-1.5 px-5"
                disabled={cart.items.length === 0}
                onClick={() => setShowPayment(true)}
                data-tour="payment-btn"
              >
                Bayar
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {showPayment && (
          <PaymentModal
            total={total}
            onPay={handlePayment}
            onClose={() => setShowPayment(false)}
          />
        )}

        {/* ── Mobile: floating cart button + Sheet ── */}
        <div className="sm:hidden">
          <button
            className="fixed right-4 bottom-20 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg"
            onClick={() => setShowMobileCart(true)}
          >
            <ShoppingCart className="size-5" />
            {itemCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary-foreground text-[10px] font-bold text-primary">
                {itemCount}
              </span>
            )}
            <span className="text-sm font-semibold">{formatRupiah(total)}</span>
          </button>
          <Sheet open={showMobileCart} onOpenChange={setShowMobileCart}>
            <SheetContent
              side="bottom"
              showCloseButton={false}
              className="flex h-[85vh] flex-col rounded-t-2xl p-0"
            >
              <SheetHeader className="flex shrink-0 flex-row items-center gap-2 border-b px-4 py-3">
                <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                  <ShoppingCart className="size-4 text-muted-foreground" />
                  Pesanan
                  {itemCount > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {itemCount}
                    </span>
                  )}
                </SheetTitle>
                {cart.items.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto size-7"
                    title="Parkir order"
                    onClick={() => {
                      cart.holdOrder()
                      toast.info("Order diparkirkan")
                    }}
                  >
                    <PauseCircle className="size-4 text-muted-foreground" />
                  </Button>
                )}
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                {cart.items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ShoppingCart className="size-8 opacity-20" />
                    <p className="text-xs">Keranjang kosong</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {cart.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center gap-2 px-4 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRupiah(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="flex size-6 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                            onClick={() =>
                              cart.updateQuantity(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-medium">
                            {item.quantity}
                          </span>
                          <button
                            className="flex size-6 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                            onClick={() =>
                              cart.updateQuantity(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-xs font-semibold">
                            {formatRupiah(item.price * item.quantity)}
                          </span>
                          <button
                            className="text-[10px] text-muted-foreground transition-colors hover:text-destructive"
                            onClick={() => cart.removeItem(item.productId)}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0 border-t bg-muted/20 p-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground">
                      {formatRupiah(cart.subtotal())}
                    </span>
                  </div>
                  {cart.discountAmount() > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Diskon</span>
                      <span>−{formatRupiah(cart.discountAmount())}</span>
                    </div>
                  )}
                  {taxRate > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Pajak ({taxRate}%)</span>
                      <span className="text-foreground">
                        {formatRupiah(cart.taxAmount(taxRate))}
                      </span>
                    </div>
                  )}
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      Total
                    </p>
                    <p className="text-xl font-bold">{formatRupiah(total)}</p>
                  </div>
                  <Button
                    size="lg"
                    className="gap-1.5 px-5"
                    disabled={cart.items.length === 0}
                    onClick={() => setShowPayment(true)}
                  >
                    Bayar <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
