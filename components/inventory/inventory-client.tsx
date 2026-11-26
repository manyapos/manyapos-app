"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { type ColumnDef } from "@/components/ui/data-table"
import { adjustStock } from "@/lib/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { PackageSearch, PackagePlus, SlidersHorizontal, History } from "lucide-react"
import { formatRupiah, formatDate } from "@/lib/format"
import { cn } from "cn"

type Product = { id: string; name: string; sku: string; unit: string; stock: number; minStock: number; costPrice: number; category: string }
type Movement = { id: string; type: string; quantity: number; note: string | null; createdAt: Date; productName: string; unit: string; userName: string }

const tabs = [
  { key: "stock",      label: "Stok",         icon: PackageSearch },
  { key: "in",         label: "Stock In",     icon: PackagePlus },
  { key: "adjustment", label: "Penyesuaian",  icon: SlidersHorizontal, tour: "adjust-stock-btn" },
  { key: "history",    label: "Riwayat",      icon: History },
]

const stockSchema = z.object({
  productId: z.string().min(1, "Pilih produk"),
  type:      z.enum(["in", "out", "adjustment"]),
  quantity:  z.coerce.number().int().min(1, "Jumlah minimal 1"),
  note:      z.string().optional(),
})
type StockValues = z.infer<typeof stockSchema>

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-destructive mt-1">{msg}</p>
}

function StockForm({ products, type }: { products: Product[]; type: "in" | "out" | "adjustment" }) {
  const router = useRouter()
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<StockValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: { productId: "", type, quantity: 1, note: "" },
  })

  async function onSubmit(data: StockValues) {
    try {
      await adjustStock({ productId: data.productId, type: data.type, quantity: data.quantity, note: data.note || undefined })
      toast.success("Stok diperbarui")
      reset()
      router.refresh()
    } catch {
      toast.error("Gagal memperbarui stok")
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Produk</Label>
            <Controller name="productId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Pilih produk" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} (Stok: {p.stock} {p.unit})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
            <FieldError msg={errors.productId?.message} />
          </div>

          {type === "adjustment" && (
            <div className="space-y-2">
              <Label>Tipe Penyesuaian</Label>
              <Controller name="type" control={control} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Tambah Stok</SelectItem>
                    <SelectItem value="out">Kurang Stok</SelectItem>
                    <SelectItem value="adjustment">Koreksi (set ke nilai)</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="qty">Jumlah</Label>
            <Input id="qty" type="number" min="1" placeholder="0" {...register("quantity")} />
            <FieldError msg={errors.quantity?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Catatan</Label>
            <Input id="note" placeholder="Catatan (opsional)" {...register("note")} />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : type === "in" ? "Tambah Stok" : "Simpan Penyesuaian"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function InventoryClient({ tab, products, movements }: {
  tab: string; products: Product[]; movements: Movement[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(tab)

  function switchTab(key: string) {
    setActiveTab(key)
    router.push(`/dashboard/inventory?tab=${key}`, { scroll: false })
  }

  const typeColor: Record<string, string> = { in: "text-green-600", out: "text-destructive", adjustment: "text-amber-600" }
  const typeLabel: Record<string, string> = { in: "Masuk", out: "Keluar", adjustment: "Penyesuaian" }
  const totalStockValue = products.reduce((s, p) => s + p.stock * p.costPrice, 0)

  const stockColumns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Produk", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "sku", header: "SKU", className: "hidden sm:table-cell", cell: ({ row }) => <span className="font-mono text-xs">{row.original.sku}</span> },
    { accessorKey: "category", header: "Kategori", className: "hidden md:table-cell" },
    { accessorKey: "stock", header: "Stok", cell: ({ row }) => <span>{row.original.stock} {row.original.unit}</span> },
    { accessorKey: "minStock", header: "Min.", className: "hidden sm:table-cell" },
    { id: "stockValue", header: "Nilai", className: "hidden md:table-cell", cell: ({ row }) => formatRupiah(row.original.stock * row.original.costPrice) },
    {
      id: "status", header: "Status",
      cell: ({ row }) => {
        const p = row.original
        if (p.stock <= 0) return <Badge variant="destructive">Habis</Badge>
        if (p.stock <= p.minStock) return <Badge variant="outline" className="border-amber-300 text-amber-700">Rendah</Badge>
        return <Badge variant="secondary">Normal</Badge>
      },
    },
  ]

  const movementColumns: ColumnDef<Movement>[] = [
    { accessorKey: "createdAt", header: "Waktu", cell: ({ row }) => <span className="text-xs">{formatDate(row.original.createdAt)}</span> },
    { accessorKey: "productName", header: "Produk", cell: ({ row }) => <span className="font-medium">{row.original.productName}</span> },
    {
      accessorKey: "type", header: "Tipe",
      cell: ({ row }) => <span className={cn("font-medium", typeColor[row.original.type] || "")}>{typeLabel[row.original.type] || row.original.type}</span>,
    },
    {
      accessorKey: "quantity", header: "Jml",
      cell: ({ row }) => {
        const m = row.original
        return <span className={m.type === "out" ? "text-destructive" : "text-green-600"}>{m.type === "out" ? "-" : "+"}{m.quantity} {m.unit}</span>
      },
    },
    { accessorKey: "note", header: "Catatan", className: "hidden sm:table-cell", cell: ({ row }) => <span className="text-muted-foreground">{row.original.note || "—"}</span> },
    { accessorKey: "userName", header: "Oleh", className: "hidden sm:table-cell" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto rounded-lg border bg-muted/40 p-1 scrollbar-none">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => switchTab(t.key)}
            {...("tour" in t && t.tour ? { "data-tour": t.tour } : {})}
            className={cn("flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === t.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}>
            <t.icon className="size-4" /><span className="hidden sm:inline">{t.label}</span><span className="sm:hidden">{t.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {activeTab === "stock" && (
        <div className="space-y-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Nilai Stok</p>
              <p className="mt-1 text-2xl font-bold">{formatRupiah(totalStockValue)}</p>
            </CardContent>
          </Card>
          <div data-tour="stock-table">
            <DataTable columns={stockColumns} data={products} searchKey="name" searchPlaceholder="Cari produk..." />
          </div>
        </div>
      )}
      {activeTab === "in" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Catat penerimaan barang masuk dari supplier atau produksi.</p>
          <StockForm products={products} type="in" />
        </div>
      )}
      {activeTab === "adjustment" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Koreksi stok karena selisih fisik, kerusakan, atau kesalahan pencatatan.</p>
          <StockForm products={products} type="adjustment" />
        </div>
      )}
      {activeTab === "history" && (
        <Card>
          <CardHeader><CardTitle>Riwayat Mutasi Stok</CardTitle></CardHeader>
          <CardContent>
            <DataTable columns={movementColumns} data={movements} searchKey="productName" searchPlaceholder="Cari produk..." />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
