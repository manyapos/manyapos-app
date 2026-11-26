import { prisma } from "@/lib/prisma"
import { CategoryList } from "@/components/categories/category-list"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  })

  return (
    <CategoryList categories={categories.map((c) => ({ ...c, productCount: c._count.products }))} />
  )
}
