"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  discount: number
}

export interface HeldOrder {
  id: string
  label: string
  items: CartItem[]
  customerId: string | null
  discount: number
  discountType: "percentage" | "fixed"
  note: string
  heldAt: number
}

interface CartStore {
  items: CartItem[]
  customerId: string | null
  discount: number
  discountType: "percentage" | "fixed"
  note: string
  heldOrders: HeldOrder[]
  addItem: (product: { id: string; name: string; price: number }) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  setCustomer: (id: string | null) => void
  setDiscount: (amount: number, type: "percentage" | "fixed") => void
  setNote: (note: string) => void
  clear: () => void
  holdOrder: (label?: string) => void
  recallOrder: (id: string) => void
  deleteHeldOrder: (id: string) => void
  subtotal: () => number
  discountAmount: () => number
  total: (taxRate: number) => number
  taxAmount: (taxRate: number) => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customerId: null,
      discount: 0,
      discountType: "fixed",
      note: "",
      heldOrders: [],

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }
          return {
            items: [...state.items, { productId: product.id, name: product.name, price: product.price, quantity: 1, discount: 0 }],
          }
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.productId !== productId)
            : state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      setCustomer: (id) => set({ customerId: id }),
      setDiscount: (amount, type) => set({ discount: amount, discountType: type }),
      setNote: (note) => set({ note }),
      clear: () => set({ items: [], customerId: null, discount: 0, discountType: "fixed", note: "" }),

      holdOrder: (label) => {
        const state = get()
        if (state.items.length === 0) return
        const held: HeldOrder = {
          id: Date.now().toString(),
          label: label || `Order #${state.heldOrders.length + 1}`,
          items: state.items,
          customerId: state.customerId,
          discount: state.discount,
          discountType: state.discountType,
          note: state.note,
          heldAt: Date.now(),
        }
        set((s) => ({
          heldOrders: [...s.heldOrders, held],
          items: [], customerId: null, discount: 0, discountType: "fixed", note: "",
        }))
      },

      recallOrder: (id) => {
        const state = get()
        const held = state.heldOrders.find(o => o.id === id)
        if (!held) return
        // Save current cart back to held if not empty
        const newHeld = state.items.length > 0
          ? [...state.heldOrders.filter(o => o.id !== id), {
              id: Date.now().toString(),
              label: `Order (disimpan)`,
              items: state.items,
              customerId: state.customerId,
              discount: state.discount,
              discountType: state.discountType,
              note: state.note,
              heldAt: Date.now(),
            }]
          : state.heldOrders.filter(o => o.id !== id)
        set({
          heldOrders: newHeld,
          items: held.items,
          customerId: held.customerId,
          discount: held.discount,
          discountType: held.discountType,
          note: held.note,
        })
      },

      deleteHeldOrder: (id) =>
        set((s) => ({ heldOrders: s.heldOrders.filter(o => o.id !== id) })),

      subtotal: () => get().items.reduce((sum, i) => sum + (i.price - i.discount) * i.quantity, 0),

      discountAmount: () => {
        const sub = get().subtotal()
        const { discount, discountType } = get()
        return discountType === "percentage" ? Math.round(sub * discount / 100) : discount
      },

      taxAmount: (taxRate: number) => {
        const afterDiscount = get().subtotal() - get().discountAmount()
        return Math.round(afterDiscount * taxRate / 100)
      },

      total: (taxRate: number) => {
        const afterDiscount = get().subtotal() - get().discountAmount()
        return afterDiscount + get().taxAmount(taxRate)
      },
    }),
    { name: "manya-cart" }
  )
)

