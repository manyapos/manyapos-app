"use client"

import { useState } from "react"
import { formatRupiah } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Banknote, QrCode, CreditCard, Smartphone, X } from "lucide-react"

const METHODS = [
  { key: "cash",    label: "Tunai",   icon: Banknote },
  { key: "qris",   label: "QRIS",    icon: QrCode },
  { key: "card",   label: "Kartu",   icon: CreditCard },
  { key: "ewallet",label: "E-Wallet",icon: Smartphone },
]

// Quick-pay nominal yang sudah "dibulatkan" ke pecahan umum IDR
const QUICK = [10000, 20000, 50000, 100000, 200000, 500000]

export function PaymentModal({
  total,
  onPay,
  onClose,
}: {
  total: number
  onPay: (method: string, amountPaid: number) => Promise<void>
  onClose: () => void
}) {
  const [method, setMethod] = useState("cash")
  const [amountPaid, setAmountPaid] = useState(total)
  const [display, setDisplay] = useState(() => (total / 100).toLocaleString("id-ID"))
  const [loading, setLoading] = useState(false)

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "")
    const num = digits ? parseInt(digits, 10) : 0
    setDisplay(digits ? num.toLocaleString("id-ID") : "")
    setAmountPaid(num * 100)
  }

  function setQuick(amt: number) {
    setAmountPaid(amt)
    setDisplay((amt / 100).toLocaleString("id-ID"))
  }

  const change = amountPaid - total
  const canPay = method !== "cash" || amountPaid >= total

  async function handlePay() {
    if (!canPay) return
    setLoading(true)
    await onPay(method, method === "cash" ? amountPaid : total)
    setLoading(false)
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 max-h-[90dvh] overflow-y-auto" showCloseButton={false}>
        {/* ── Total banner ── */}
        <div className="bg-primary px-6 py-5 text-primary-foreground sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Total Pembayaran</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{formatRupiah(total)}</p>
            </div>
            <button
              className="rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity"
              onClick={onClose}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* ── Payment method selector ── */}
          <div>
            <p className="mb-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Metode Bayar</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {METHODS.map((m) => {
                const active = method === m.key
                return (
                  <button
                    key={m.key}
                    onClick={() => {
                      setMethod(m.key)
                      if (m.key !== "cash") {
                        setAmountPaid(total)
                        setDisplay((total / 100).toLocaleString("id-ID"))
                      }
                    }}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 py-3 text-xs font-medium transition-all
                      ${active
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                  >
                    <m.icon className="size-5" />
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Cash input ── */}
          {method === "cash" && (
            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Jumlah Diterima</p>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={display}
                  onChange={handleAmountChange}
                  className="h-11 text-right text-lg font-bold tracking-tight"
                  autoFocus
                />
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-3 gap-1.5">
                {QUICK.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setQuick(amt)}
                    className={`rounded-lg border py-1.5 text-xs font-medium transition-colors hover:border-primary/50 hover:bg-primary/5
                      ${amountPaid === amt ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground"}`}
                  >
                    {formatRupiah(amt)}
                  </button>
                ))}
              </div>

              {/* Change display */}
              {change >= 0 && amountPaid > 0 && (
                <div className={`flex items-center justify-between rounded-xl px-4 py-3
                  ${change > 0 ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-muted"}`}
                >
                  <span className="text-sm text-muted-foreground">Kembalian</span>
                  <span className={`text-lg font-bold ${change > 0 ? "text-emerald-600" : "text-foreground"}`}>
                    {formatRupiah(change)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Confirm button ── */}
          <Button
            className="w-full h-11 text-base font-semibold"
            onClick={handlePay}
            disabled={loading || !canPay}
          >
            {loading ? "Memproses..." : "Konfirmasi Pembayaran"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
