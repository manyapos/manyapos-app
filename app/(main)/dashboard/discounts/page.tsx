import { prisma } from "@/lib/prisma"
import { PageTitle } from "@/components/ui/page-title"
import { DiscountsClient } from "@/components/discounts/discounts-client"

export default async function DiscountsPage() {
  const discounts = await prisma.discount.findMany({ orderBy: { createdAt: "desc" } })
  return (
    <div className="space-y-4">
      <PageTitle title="Diskon & Promo" description="Kelola kode promo, diskon persentase, dan diskon nominal untuk transaksi POS." />
      <DiscountsClient discounts={discounts} />
    </div>
  )
}
