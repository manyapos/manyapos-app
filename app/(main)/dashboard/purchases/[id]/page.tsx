import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PageTitle } from "@/components/ui/page-title"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatRupiah, formatDate } from "@/lib/format"
import { ReceivePOButton } from "@/components/purchases/receive-po-button"

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft", ordered: "Dipesan", received: "Diterima", cancelled: "Dibatalkan",
}
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline", ordered: "secondary", received: "default", cancelled: "destructive",
}

export default async function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      user: { select: { name: true } },
      items: true,
    },
  })
  if (!po) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageTitle
          title={`PO-${po.id.slice(-8).toUpperCase()}`}
          description={`Dibuat oleh ${po.user.name} pada ${formatDate(po.createdAt)}`}
        />
        <Badge variant={STATUS_VARIANT[po.status]}>{STATUS_LABEL[po.status] ?? po.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Supplier info */}
        <Card>
          <CardHeader><CardTitle>Supplier</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-semibold">{po.supplier.name}</p>
            {po.supplier.phone && <p className="text-muted-foreground">{po.supplier.phone}</p>}
            {po.supplier.email && <p className="text-muted-foreground">{po.supplier.email}</p>}
            {po.supplier.address && <p className="text-muted-foreground text-xs">{po.supplier.address}</p>}
            {po.note && <p className="mt-2 text-muted-foreground italic">"{po.note}"</p>}
          </CardContent>
        </Card>

        {/* Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Item Produk</CardTitle>
              <ReceivePOButton
                poId={po.id}
                status={po.status}
                items={po.items.map(i => ({
                  productId: i.productId,
                  productName: i.productName,
                  quantity: i.quantity,
                  costPrice: i.costPrice,
                  subtotal: i.subtotal,
                }))}
              />
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="px-4 py-2 font-medium text-muted-foreground">Produk</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">Qty</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">Harga Modal</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {po.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-2">{item.productName}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">{formatRupiah(item.costPrice)}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatRupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-muted/30">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 font-semibold text-right">Total</td>
                    <td className="px-4 py-2 font-bold text-right">{formatRupiah(po.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
