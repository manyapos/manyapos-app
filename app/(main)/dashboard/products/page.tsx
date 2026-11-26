import { prisma } from "@/lib/prisma"
import { ProductListClient } from "@/components/products/product-list-client"

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams
  const where: Record<string, unknown> = { isActive: true }
  if (params.q) where.name = { contains: params.q }
  if (params.category) where.categoryId = params.category

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  return <ProductListClient products={products} categories={categories} query={params.q} />
}
