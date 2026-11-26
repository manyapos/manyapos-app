import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ProductForm } from "@/components/products/product-form"
import { PageTitle } from "@/components/ui/page-title"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <PageTitle title="Edit Produk" description="Ubah detail produk, harga, stok, dan kelola varian produk." />
      <ProductForm product={product} categories={categories} />
    </div>
  )
}
