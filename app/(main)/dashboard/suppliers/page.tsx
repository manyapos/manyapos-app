import { prisma } from "@/lib/prisma"
import { PageTitle } from "@/components/ui/page-title"
import { SuppliersClient } from "@/components/suppliers/suppliers-client"

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } })
  return (
    <div className="space-y-4">
      <SuppliersClient suppliers={suppliers} />
    </div>
  )
}
