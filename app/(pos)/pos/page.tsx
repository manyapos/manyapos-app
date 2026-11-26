import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { POSClient } from "@/components/pos/pos-client"

export default async function POSPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const [products, categories, customers, settings] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, include: { category: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.customer.findMany({ orderBy: { name: "asc" }, take: 100 }),
    prisma.setting.findMany(),
  ])

  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))

  return (
    <POSClient
      products={products.map((p) => ({ ...p, category: p.category }))}
      categories={categories}
      customers={customers}
      taxRate={settingsMap.tax_enabled === "true" ? Number(settingsMap.tax_rate || 0) : 0}
      storeName={settingsMap.store_name || "Manya POS"}
    />
  )
}
