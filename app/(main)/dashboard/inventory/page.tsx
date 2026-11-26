import { prisma } from "@/lib/prisma"
import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { InventoryClient } from "@/components/inventory/inventory-client"
import { FilterBar } from "@/components/ui/filter-bar"
import { Suspense } from "react"
import { PageTitle } from "@/components/ui/page-title"

type SP = { tab?: string; category?: string; stockStatus?: string; movementFrom?: string; movementTo?: string; movementType?: string }

const STOCK_FILTERS = [
  { key: "category", label: "Kategori", type: "select" as const, options: [] as { value: string; label: string }[] },
  {
    key: "stockStatus", label: "Status Stok", type: "select" as const,
    options: [
      { value: "low", label: "Stok Rendah" },
      { value: "empty", label: "Stok Habis" },
      { value: "normal", label: "Normal" },
    ],
  },
]

const HISTORY_FILTERS = [
  { type: "daterange" as const, fromKey: "movementFrom", toKey: "movementTo", label: "Tanggal" },
  {
    key: "movementType", label: "Tipe", type: "select" as const,
    options: [
      { value: "in", label: "Masuk" },
      { value: "out", label: "Keluar" },
      { value: "adjustment", label: "Penyesuaian" },
    ],
  },
]

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<SP>
}) {
  const { tab = "stock", category, stockStatus, movementFrom, movementTo, movementType } = await searchParams

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
  STOCK_FILTERS[0].options = categories.map(c => ({ value: c.id, label: c.name }))

  const productWhere: Record<string, unknown> = { isActive: true }
  if (category) productWhere.categoryId = category

  const movementWhere: Record<string, unknown> = {}
  if (movementType) movementWhere.type = movementType
  if (movementFrom || movementTo) {
    movementWhere.createdAt = {
      ...(movementFrom ? { gte: new Date(movementFrom) } : {}),
      ...(movementTo ? { lte: new Date(movementTo + "T23:59:59") } : {}),
    }
  }

  const [products, movements] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,
      include: { category: true },
      orderBy: { stock: "asc" },
    }),
    prisma.stockMovement.findMany({
      where: movementWhere,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        product: { select: { name: true, unit: true } },
        user: { select: { name: true } },
      },
    }),
  ])

  // Filter stok status di app (tidak butuh query baru)
  const filteredProducts = stockStatus
    ? products.filter(p =>
        stockStatus === "empty" ? p.stock <= 0
        : stockStatus === "low" ? p.stock > 0 && p.stock <= p.minStock
        : p.stock > p.minStock
      )
    : products

  const lowStock = products.filter(p => p.stock <= p.minStock)

  return (
    <div className="space-y-4">
      <PageTitle title="Inventori" description="Pantau stok produk, terima peringatan stok rendah, dan lihat riwayat mutasi stok." />

      {lowStock.length > 0 && (
        <Card className="border-amber-200" data-tour="low-stock-alert">
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-amber-700">
              <AlertTriangle className="size-5" />
              <span className="font-semibold">Stok Rendah ({lowStock.length} produk)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStock.map(p => (
                <Badge key={p.id} variant="outline" className="border-amber-300 text-amber-800">
                  {p.name}: {p.stock} {p.unit}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Suspense>
        {tab === "history"
          ? <FilterBar filters={HISTORY_FILTERS} />
          : <FilterBar filters={STOCK_FILTERS} />
        }
      </Suspense>

      <InventoryClient
        tab={tab}
        products={filteredProducts.map(p => ({
          id: p.id, name: p.name, sku: p.sku, unit: p.unit,
          stock: p.stock, minStock: p.minStock, costPrice: p.costPrice,
          category: p.category.name,
        }))}
        movements={movements.map(m => ({
          id: m.id, type: m.type, quantity: m.quantity,
          note: m.note, createdAt: m.createdAt,
          productName: m.product.name, unit: m.product.unit,
          userName: m.user.name,
        }))}
      />
    </div>
  )
}
