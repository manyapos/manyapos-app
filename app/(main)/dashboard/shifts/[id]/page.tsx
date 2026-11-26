import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatRupiah, formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTitle } from "@/components/ui/page-title"
import { Separator } from "@/components/ui/separator"
import { ShiftTransactionsTable } from "@/components/shifts/shift-transactions-table"

export default async function ShiftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const shift = await prisma.shift.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      transactions: {
        where: { status: "completed" },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  })
  if (!shift) notFound()

  const selisihKas = shift.closingBalance != null
    ? shift.closingBalance - (shift.openingBalance + shift.totalCash)
    : null

  const paymentBreakdown = [
    { label: "Tunai", value: shift.totalCash },
    { label: "QRIS", value: shift.totalQris },
    { label: "Kartu", value: shift.totalCard },
    { label: "E-Wallet", value: shift.totalEwallet },
  ]

  return (
    <div className="space-y-6">
      <div>
        <PageTitle title="Detail Shift" description="Rekap lengkap satu shift: total per metode bayar, selisih kas, dan daftar transaksi." />
        <p className="text-sm text-muted-foreground">{shift.user.name} · {formatDate(shift.startTime)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Saldo Awal", value: formatRupiah(shift.openingBalance) },
          { label: "Total Penjualan", value: formatRupiah(shift.totalSales) },
          { label: "Saldo Penutup", value: shift.closingBalance != null ? formatRupiah(shift.closingBalance) : "—" },
          {
            label: "Selisih Kas",
            value: selisihKas != null ? formatRupiah(Math.abs(selisihKas)) : "—",
            highlight: selisihKas != null && selisihKas !== 0,
          },
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className={`mt-1 text-xl font-bold ${c.highlight ? "text-destructive" : ""}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Rekap per Metode Pembayaran</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {paymentBreakdown.map((p) => (
              <div key={p.label} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{p.label}</p>
                <p className="mt-1 font-semibold">{formatRupiah(p.value)}</p>
              </div>
            ))}
          </div>
          {shift.note && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">Catatan: {shift.note}</p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaksi ({shift.transactions.length})</CardTitle>
            <Badge variant={shift.status === "open" ? "default" : "secondary"}>
              {shift.status === "open" ? "Aktif" : "Selesai"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ShiftTransactionsTable transactions={shift.transactions} />
        </CardContent>
      </Card>
    </div>
  )
}
