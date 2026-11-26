import { prisma } from "@/lib/prisma"
import { PageTitle } from "@/components/ui/page-title"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatRupiah, formatDate } from "@/lib/format"
import Link from "next/link"
import { Plus } from "lucide-react"

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft", ordered: "Dipesan", received: "Diterima", cancelled: "Dibatalkan",
}
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline", ordered: "secondary", received: "default", cancelled: "destructive",
}

export default async function PurchasesPage() {
  const orders = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { select: { name: true } },
      user: { select: { name: true } },
      _count: { select: { items: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle title="Purchase Order" description="Kelola pembelian stok dari supplier." />
        <Link href="/dashboard/purchases/new" data-tour="create-po-btn" className="inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-medium text-primary-foreground whitespace-nowrap transition-all hover:bg-primary/80"><Plus className="size-4 mr-1" />Buat PO</Link>
      </div>

      {orders.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Belum ada purchase order.</CardContent></Card>
      ) : (
        <div className="space-y-3" data-tour="po-list">
          {orders.map((po) => (
            <Link key={po.id} href={`/dashboard/purchases/${po.id}`}>
              <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">PO-{po.id.slice(-8).toUpperCase()}</p>
                    <p className="font-semibold mt-0.5">{po.supplier.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {po._count.items} item · {formatDate(po.createdAt)} · oleh {po.user.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatRupiah(po.total)}</p>
                    <Badge variant={STATUS_VARIANT[po.status]} className="mt-1 capitalize">
                      {STATUS_LABEL[po.status] ?? po.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
