import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatRupiah, formatDate } from "@/lib/format"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PageTitle } from "@/components/ui/page-title"
import { TransactionItemsTable } from "@/components/transactions/transaction-items-table"
import { PrintReceiptButton } from "@/components/pos/print-receipt-button"

export default async function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [tx, settings] = await Promise.all([
    prisma.transaction.findUnique({
      where: { id },
      include: { user: { select: { name: true } }, customer: { select: { name: true } }, items: true },
    }),
    prisma.setting.findMany(),
  ])

  if (!tx) notFound()

  const settingMap = Object.fromEntries(settings.map(s => [s.key, s.value]))
  const receiptData = {
    invoiceNumber: tx.invoiceNumber,
    createdAt: tx.createdAt,
    cashierName: tx.user.name,
    customerName: tx.customer?.name,
    items: tx.items.map(i => ({
      productName: i.productName,
      quantity: i.quantity,
      price: i.price,
      discount: i.discount,
      subtotal: i.subtotal,
    })),
    subtotal: tx.subtotal,
    discount: tx.discount,
    tax: tx.tax,
    total: tx.total,
    amountPaid: tx.amountPaid,
    change: tx.change,
    paymentMethod: tx.paymentMethod,
    storeName: settingMap["store_name"] || "Manya POS",
    storeAddress: settingMap["store_address"],
    storePhone: settingMap["store_phone"],
    receiptHeader: settingMap["receipt_header"],
    receiptFooter: settingMap["receipt_footer"],
    note: tx.note,
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageTitle title="Detail Transaksi" description="Detail lengkap satu transaksi: item, pembayaran, dan opsi cetak ulang atau refund." />
        <PrintReceiptButton data={receiptData} />
      </div>

      <Card>
        <CardContent>
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Invoice:</span> <span className="font-mono">{tx.invoiceNumber}</span></div>
            <div><span className="text-muted-foreground">Tanggal:</span> {formatDate(tx.createdAt)}</div>
            <div><span className="text-muted-foreground">Kasir:</span> {tx.user.name}</div>
            <div><span className="text-muted-foreground">Pelanggan:</span> {tx.customer?.name || "-"}</div>
            <div><span className="text-muted-foreground">Metode:</span> <span className="capitalize">{tx.paymentMethod}</span></div>
            <div><span className="text-muted-foreground">Status:</span> <span className="capitalize">{tx.status}</span></div>
          </div>

          <TransactionItemsTable items={tx.items} />

          <Separator className="my-4" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatRupiah(tx.subtotal)}</span></div>
            {tx.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Diskon</span><span>-{formatRupiah(tx.discount)}</span></div>}
            {tx.tax > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Pajak</span><span>{formatRupiah(tx.tax)}</span></div>}
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatRupiah(tx.total)}</span></div>
            {tx.paymentMethod === "cash" && (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Dibayar</span><span>{formatRupiah(tx.amountPaid)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Kembalian</span><span>{formatRupiah(tx.change)}</span></div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
