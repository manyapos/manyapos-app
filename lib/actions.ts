"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generateInvoiceNumber } from "@/lib/format"
import { revalidatePath } from "next/cache"
import bcryptjs from "bcryptjs"
const { hash } = bcryptjs

// ─── Transactions ────────────────────────────────────────

export async function createTransaction(data: {
  items: { productId: string; productName: string; quantity: number; price: number; discount: number; subtotal: number }[]
  subtotal: number
  discount: number
  discountType: string
  tax: number
  total: number
  paymentMethod: string
  amountPaid: number
  change: number
  customerId?: string
  note?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const tx = await prisma.$transaction(async (db) => {
    const transaction = await db.transaction.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        userId: session.user.id,
        customerId: data.customerId || null,
        subtotal: data.subtotal,
        discount: data.discount,
        discountType: data.discountType,
        tax: data.tax,
        total: data.total,
        paymentMethod: data.paymentMethod,
        amountPaid: data.amountPaid,
        change: data.change,
        note: data.note || null,
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    })

    // Decrement stock
    for (const item of data.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
      await db.stockMovement.create({
        data: {
          productId: item.productId,
          type: "out",
          quantity: item.quantity,
          note: `Penjualan ${transaction.invoiceNumber}`,
          userId: session.user.id,
        },
      })
    }

    // Update customer total spent
    if (data.customerId) {
      await db.customer.update({
        where: { id: data.customerId },
        data: { totalSpent: { increment: data.total } },
      })
    }

    // Low-stock notifications
    const lowStockProducts = (
      await Promise.all(data.items.map(i => db.product.findUnique({ where: { id: i.productId } })))
    ).filter((p): p is NonNullable<typeof p> => !!p && p.stock <= p.minStock)

    if (lowStockProducts.length) {
      await db.notification.createMany({
        data: lowStockProducts.map(p => ({
          type: "low_stock",
          message: `Stok "${p.name}" tinggal ${p.stock} ${p.unit} (minimum: ${p.minStock})`,
        })),
      })
    }

    // Large transaction notification (≥ Rp 1.000.000)
    if (transaction.total >= 1_000_000) {
      await db.notification.create({
        data: {
          type: "large_transaction",
          message: `Transaksi besar ${transaction.invoiceNumber} senilai Rp ${(transaction.total).toLocaleString("id-ID")}`,
        },
      })
    }

    return transaction
  })

  revalidatePath("/pos")
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/notifications")
  return tx
}

export async function voidTransaction(id: string) {
  const session = await auth()
  if (!session?.user?.id || (session.user as { role: string }).role !== "ADMIN") throw new Error("Admin required")

  const tx = await prisma.transaction.findUnique({ where: { id }, include: { items: true } })
  if (!tx || tx.status !== "completed") throw new Error("Cannot void")

  await prisma.$transaction(async (db) => {
    await db.transaction.update({ where: { id }, data: { status: "voided" } })
    for (const item of tx.items) {
      await db.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
      await db.stockMovement.create({
        data: { productId: item.productId, type: "in", quantity: item.quantity, note: `Void ${tx.invoiceNumber}`, userId: session.user.id },
      })
    }
    if (tx.customerId) {
      await db.customer.update({ where: { id: tx.customerId }, data: { totalSpent: { decrement: tx.total } } })
    }
  })

  revalidatePath("/dashboard/transactions")
}

// ─── Products ────────────────────────────────────────────

export async function createProduct(data: {
  name: string; sku: string; barcode?: string; categoryId: string
  price: number; costPrice: number; stock: number; minStock: number; unit: string
}) {
  await prisma.product.create({ data })
  revalidatePath("/dashboard/products")
}

export async function updateProduct(id: string, data: {
  name?: string; sku?: string; barcode?: string; categoryId?: string
  price?: number; costPrice?: number; stock?: number; minStock?: number; unit?: string; isActive?: boolean
}) {
  await prisma.product.update({ where: { id }, data })
  revalidatePath("/dashboard/products")
}

export async function deleteProduct(id: string) {
  await prisma.product.update({ where: { id }, data: { isActive: false } })
  revalidatePath("/dashboard/products")
}

// ─── Categories ──────────────────────────────────────────

export async function createCategory(data: { name: string; slug: string; description?: string }) {
  await prisma.category.create({ data })
  revalidatePath("/dashboard/categories")
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; description?: string }) {
  await prisma.category.update({ where: { id }, data })
  revalidatePath("/dashboard/categories")
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } })
  revalidatePath("/dashboard/categories")
}

// ─── Customers ───────────────────────────────────────────

export async function createCustomer(data: { name: string; phone?: string; email?: string; address?: string }) {
  const customer = await prisma.customer.create({ data })
  revalidatePath("/dashboard/customers")
  return customer
}

export async function updateCustomer(id: string, data: { name?: string; phone?: string; email?: string; address?: string }) {
  await prisma.customer.update({ where: { id }, data })
  revalidatePath("/dashboard/customers")
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } })
  revalidatePath("/dashboard/customers")
}

// ─── Stock ───────────────────────────────────────────────

export async function adjustStock(data: { productId: string; type: string; quantity: number; note?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.$transaction(async (db) => {
    const delta = data.type === "in" ? data.quantity : -data.quantity
    await db.product.update({ where: { id: data.productId }, data: { stock: { increment: delta } } })
    await db.stockMovement.create({
      data: { productId: data.productId, type: data.type, quantity: data.quantity, note: data.note || null, userId: session.user.id },
    })
  })

  revalidatePath("/dashboard/inventory")
}

// ─── Expenses ────────────────────────────────────────────

export async function createExpense(data: { category: string; description: string; amount: number; date: Date }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  await prisma.expense.create({ data: { ...data, userId: session.user.id } })
  revalidatePath("/dashboard/expenses")
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } })
  revalidatePath("/dashboard/expenses")
}

// ─── Users ───────────────────────────────────────────────

export async function createUser(data: { name: string; email: string; password: string; role: string; pin?: string }) {
  if (data.role === "ADMIN") throw new Error("Tidak bisa membuat user dengan role Admin")
  const hashed = await hash(data.password, 12)
  await prisma.user.create({ data: { ...data, password: hashed } })
  revalidatePath("/dashboard/users")
}

export async function updateUser(id: string, data: { name?: string; email?: string; role?: string; pin?: string; password?: string }) {
  if (data.role === "ADMIN") throw new Error("Tidak bisa mengubah role menjadi Admin")
  const update: Record<string, unknown> = { ...data }
  if (data.password) update.password = await hash(data.password, 12)
  await prisma.user.update({ where: { id }, data: update })
  revalidatePath("/dashboard/users")
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } })
  revalidatePath("/dashboard/users")
}

// ─── Discounts ───────────────────────────────────────────

export async function createDiscount(data: {
  name: string; type: string; value: number; minPurchase?: number
  startDate?: Date; endDate?: Date; code?: string; usageLimit?: number
}) {
  await prisma.discount.create({ data })
  revalidatePath("/dashboard/discounts")
}

export async function updateDiscount(id: string, data: {
  name?: string; type?: string; value?: number; minPurchase?: number
  startDate?: Date | null; endDate?: Date | null; code?: string | null; usageLimit?: number | null; isActive?: boolean
}) {
  await prisma.discount.update({ where: { id }, data })
  revalidatePath("/dashboard/discounts")
}

export async function deleteDiscount(id: string) {
  await prisma.discount.delete({ where: { id } })
  revalidatePath("/dashboard/discounts")
}

export async function toggleDiscount(id: string, isActive: boolean) {
  await prisma.discount.update({ where: { id }, data: { isActive } })
  revalidatePath("/dashboard/discounts")
}

// ─── Notifications ───────────────────────────────────────

export async function markNotificationRead(id: string) {
  await prisma.notification.update({ where: { id }, data: { isRead: true } })
  revalidatePath("/dashboard/notifications")
}

export async function markAllNotificationsRead() {
  await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } })
  revalidatePath("/dashboard/notifications")
}

export async function deleteNotification(id: string) {
  await prisma.notification.delete({ where: { id } })
  revalidatePath("/dashboard/notifications")
}

// ─── Shifts ──────────────────────────────────────────────

export async function openShift(data: { openingBalance: number; note?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Cek apakah sudah ada shift aktif untuk user ini
  const existing = await prisma.shift.findFirst({
    where: { userId: session.user.id, status: "open" },
  })
  if (existing) throw new Error("Shift sudah aktif")

  const shift = await prisma.shift.create({
    data: {
      userId: session.user.id,
      openingBalance: data.openingBalance,
      note: data.note || null,
    },
  })

  revalidatePath("/dashboard/shifts")
  revalidatePath("/pos")
  return shift
}

export async function closeShift(id: string, data: { closingBalance: number; note?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const shift = await prisma.shift.findUnique({
    where: { id },
    include: { transactions: { where: { status: "completed" } } },
  })
  if (!shift || shift.status !== "open") throw new Error("Shift tidak aktif")
  if (shift.userId !== session.user.id && (session.user as { role: string }).role === "CASHIER") {
    throw new Error("Bukan shift Anda")
  }

  const txs = shift.transactions
  const totalCash = txs.filter((t) => t.paymentMethod === "cash").reduce((s, t) => s + t.total, 0)
  const totalQris = txs.filter((t) => t.paymentMethod === "qris").reduce((s, t) => s + t.total, 0)
  const totalCard = txs.filter((t) => t.paymentMethod === "card").reduce((s, t) => s + t.total, 0)
  const totalEwallet = txs.filter((t) => t.paymentMethod === "ewallet").reduce((s, t) => s + t.total, 0)
  const totalSales = txs.reduce((s, t) => s + t.total, 0)

  await prisma.shift.update({
    where: { id },
    data: {
      status: "closed",
      endTime: new Date(),
      closingBalance: data.closingBalance,
      note: data.note || shift.note || null,
      totalCash,
      totalQris,
      totalCard,
      totalEwallet,
      totalSales,
      totalTransactions: txs.length,
    },
  })

  await prisma.notification.create({
    data: {
      type: "shift_end",
      message: `Shift ditutup — ${txs.length} transaksi, total penjualan Rp ${totalSales.toLocaleString("id-ID")}`,
      userId: shift.userId,
    },
  })

  revalidatePath("/dashboard/shifts")
  revalidatePath("/dashboard/notifications")
  revalidatePath("/pos")
}

export async function getActiveShift() {
  const session = await auth()
  if (!session?.user?.id) return null
  return prisma.shift.findFirst({
    where: { userId: session.user.id, status: "open" },
  })
}

// ─── Settings ────────────────────────────────────────────

export async function updateSettings(settings: { key: string; value: string }[]) {
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s })
  }
  revalidatePath("/dashboard/settings")
}

export async function getSettings() {
  const settings = await prisma.setting.findMany()
  return Object.fromEntries(settings.map((s) => [s.key, s.value]))
}

// ─── Suppliers ───────────────────────────────────────────

export async function createSupplier(data: { name: string; phone?: string; email?: string; address?: string; notes?: string }) {
  await prisma.supplier.create({ data })
  revalidatePath("/dashboard/suppliers")
}

export async function updateSupplier(id: string, data: { name?: string; phone?: string; email?: string; address?: string; notes?: string }) {
  await prisma.supplier.update({ where: { id }, data })
  revalidatePath("/dashboard/suppliers")
}

export async function deleteSupplier(id: string) {
  await prisma.supplier.delete({ where: { id } })
  revalidatePath("/dashboard/suppliers")
}

// ─── Purchase Orders ─────────────────────────────────────

export async function createPurchaseOrder(data: {
  supplierId: string
  note?: string
  items: { productId: string; productName: string; quantity: number; costPrice: number }[]
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  const total = data.items.reduce((s, i) => s + i.quantity * i.costPrice, 0)
  await prisma.purchaseOrder.create({
    data: {
      supplierId: data.supplierId,
      userId: session.user.id,
      status: "draft",
      total,
      note: data.note,
      items: { create: data.items.map(i => ({ ...i, subtotal: i.quantity * i.costPrice })) },
    },
  })
  revalidatePath("/dashboard/purchases")
}

export async function updatePurchaseOrderStatus(id: string, status: string) {
  await prisma.purchaseOrder.update({ where: { id }, data: { status } })
  revalidatePath("/dashboard/purchases")
  revalidatePath(`/dashboard/purchases/${id}`)
}

export async function receivePurchaseOrder(id: string, items: { productId: string; quantity: number }[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  await prisma.$transaction(async (tx) => {
    await tx.purchaseOrder.update({ where: { id }, data: { status: "received" } })
    for (const item of items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
      await tx.stockMovement.create({
        data: { productId: item.productId, type: "in", quantity: item.quantity, note: `PO #${id}`, userId: session.user!.id!, purchaseOrderId: id },
      })
    }
  })
  revalidatePath("/dashboard/purchases")
  revalidatePath(`/dashboard/purchases/${id}`)
  revalidatePath("/dashboard/inventory")
}
