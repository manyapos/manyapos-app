import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { PageTitle } from "@/components/ui/page-title"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatRupiah, formatDate } from "@/lib/format"
import { Phone, Mail, MapPin, Star, ShoppingBag, TrendingUp } from "lucide-react"

const TIER_STYLE: Record<string, string> = {
  regular:  "bg-gray-100 text-gray-700",
  silver:   "bg-slate-200 text-slate-700",
  gold:     "bg-yellow-100 text-yellow-700",
  platinum: "bg-purple-100 text-purple-700",
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending:   "secondary",
  voided:    "destructive",
  refunded:  "outline",
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { items: { select: { productName: true, quantity: true, subtotal: true } } },
      },
    },
  })

  if (!customer) notFound()

  const completedTx = customer.transactions.filter(t => t.status === "completed")
  const totalTransactions = completedTx.length
  const avgTransaction = totalTransactions > 0
    ? Math.round(completedTx.reduce((s, t) => s + t.total, 0) / totalTransactions)
    : 0

  return (
    <div className="space-y-6">
      <PageTitle
        title={customer.name}
        description="Detail pelanggan, riwayat transaksi, dan program loyalitas."
      />

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Belanja</p>
            <p className="mt-1 text-xl font-bold">{formatRupiah(customer.totalSpent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Poin</p>
            <p className="mt-1 text-xl font-bold">{customer.points.toLocaleString("id-ID")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Jumlah Transaksi</p>
            <p className="mt-1 text-xl font-bold">{totalTransactions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Rata-rata Transaksi</p>
            <p className="mt-1 text-xl font-bold">{formatRupiah(avgTransaction)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profil */}
        <Card>
          <CardHeader><CardTitle>Profil</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${TIER_STYLE[customer.tier] ?? TIER_STYLE.regular}`}>
                <Star className="inline size-3 mr-1" />{customer.tier}
              </span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0" />{customer.phone}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" />{customer.email}
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="size-4 shrink-0 mt-0.5" />{customer.address}
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="size-4 shrink-0" />
              Bergabung {formatDate(customer.createdAt)}
            </div>
          </CardContent>
        </Card>

        {/* Riwayat transaksi */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="size-4" /> Riwayat Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {customer.transactions.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-muted-foreground">Belum ada transaksi</p>
              ) : (
                <div className="divide-y">
                  {customer.transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{tx.invoiceNumber}</p>
                        <p className="text-sm font-medium">{formatRupiah(tx.total)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)} · {tx.paymentMethod}</p>
                      </div>
                      <Badge variant={STATUS_VARIANT[tx.status] ?? "secondary"} className="capitalize">
                        {tx.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
