import { prisma } from "@/lib/prisma"
import { PageTitle } from "@/components/ui/page-title"
import { NewPOForm } from "@/components/purchases/new-po-form"

export default async function NewPurchasePage() {
  const [suppliers, products] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, sku: true, costPrice: true } }),
  ])

  return (
    <div className="space-y-6">
      <PageTitle title="Buat Purchase Order" description="Buat PO baru untuk pembelian stok dari supplier." />
      <NewPOForm suppliers={suppliers} products={products} />
    </div>
  )
}
