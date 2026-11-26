import { prisma } from "@/lib/prisma"
import { ProductForm } from "@/components/products/product-form"
import { PageTitle } from "@/components/ui/page-title"

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
  return (
    <div className="space-y-6">
      <PageTitle title="Tambah Produk" description="Isi detail produk baru: nama, SKU, harga jual, harga modal, dan stok awal." />
      <ProductForm categories={categories} />
    </div>
  )
}
