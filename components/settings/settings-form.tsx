"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { updateSettings } from "@/lib/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "cn"
import {
  Store,
  Receipt,
  Banknote,
  Clock,
  BadgePercent,
  ShieldCheck,
} from "lucide-react"
import { FieldHint } from "@/components/ui/page-title"
import { TwoFactorSetup } from "@/components/settings/two-factor-setup"

// ── Schemas ──

const storeSchema = z.object({
  store_name: z.string().optional().default(""),
  store_address: z.string().optional().default(""),
  store_phone: z.string().optional().default(""),
  store_email: z.string().optional().default(""),
})
type StoreValues = z.infer<typeof storeSchema>

const taxSchema = z.object({
  tax_enabled: z.boolean().default(false),
  tax_name: z.string().optional().default("PPN"),
  tax_rate: z.string().optional().default("11"),
  tax_inclusive: z.boolean().default(false),
})
type TaxValues = z.infer<typeof taxSchema>

const receiptSchema = z.object({
  receipt_header: z.string().optional().default(""),
  receipt_footer: z.string().optional().default(""),
  receipt_show_cashier: z.boolean().default(true),
  receipt_show_customer: z.boolean().default(true),
})
type ReceiptValues = z.infer<typeof receiptSchema>

const currencySchema = z.object({
  currency_code: z.string().optional().default("IDR"),
  currency_symbol: z.string().optional().default("Rp"),
})
type CurrencyValues = z.infer<typeof currencySchema>

const shiftSchema = z.object({
  shift_enabled: z.boolean().default(false),
})
type ShiftValues = z.infer<typeof shiftSchema>

// ── Sections nav ──

const sections = [
  { key: "store", label: "Informasi Toko", icon: Store },
  { key: "tax", label: "Pajak", icon: BadgePercent },
  { key: "receipt", label: "Struk", icon: Receipt },
  { key: "currency", label: "Mata Uang", icon: Banknote },
  { key: "shift", label: "Shift", icon: Clock },
  { key: "security", label: "Keamanan", icon: ShieldCheck },
]

// ── Helpers ──

function SaveButton({ loading }: { loading: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <Button type="submit" disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan"}
      </Button>
    </div>
  )
}

function SectionCard({
  title,
  description,
  children,
  onSubmit,
  loading,
}: {
  title: string
  description?: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  loading: boolean
}) {
  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
          <Separator />
          <SaveButton loading={loading} />
        </CardContent>
      </Card>
    </form>
  )
}

// ── Main ──

export function SettingsForm({
  settings,
  twoFactorEnabled = false,
}: {
  settings: Record<string, string>
  twoFactorEnabled?: boolean
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState("store")

  async function save(section: string, data: { key: string; value: string }[]) {
    setLoading(section)
    try {
      await updateSettings(data)
      toast.success("Pengaturan disimpan")
    } catch {
      toast.error("Gagal menyimpan")
    }
    setLoading(null)
  }

  // ── Forms ──

  const storeForm = useForm<StoreValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      store_name: settings.store_name || "",
      store_address: settings.store_address || "",
      store_phone: settings.store_phone || "",
      store_email: settings.store_email || "",
    },
  })

  const taxForm = useForm<TaxValues>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      tax_enabled: settings.tax_enabled === "true",
      tax_name: settings.tax_name || "PPN",
      tax_rate: settings.tax_rate || "11",
      tax_inclusive: settings.tax_inclusive === "true",
    },
  })

  const receiptForm = useForm<ReceiptValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      receipt_header: settings.receipt_header || "",
      receipt_footer: settings.receipt_footer || "",
      receipt_show_cashier: settings.receipt_show_cashier !== "false",
      receipt_show_customer: settings.receipt_show_customer !== "false",
    },
  })

  const currencyForm = useForm<CurrencyValues>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      currency_code: settings.currency_code || "IDR",
      currency_symbol: settings.currency_symbol || "Rp",
    },
  })

  const shiftForm = useForm<ShiftValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      shift_enabled: settings.shift_enabled === "true",
    },
  })

  // ── Watched values for live preview / conditional UI ──

  const rcptHeader = receiptForm.watch("receipt_header")
  const rcptFooter = receiptForm.watch("receipt_footer")
  const rcptShowCashier = receiptForm.watch("receipt_show_cashier")
  const rcptShowCustomer = receiptForm.watch("receipt_show_customer")

  // ── Submit handlers ──

  const onStoreSubmit = storeForm.handleSubmit((v) =>
    save("store", [
      { key: "store_name", value: v.store_name ?? "" },
      { key: "store_address", value: v.store_address ?? "" },
      { key: "store_phone", value: v.store_phone ?? "" },
      { key: "store_email", value: v.store_email ?? "" },
    ])
  )

  const onTaxSubmit = taxForm.handleSubmit((v) =>
    save("tax", [
      { key: "tax_enabled", value: v.tax_enabled ? "true" : "false" },
      { key: "tax_rate", value: v.tax_rate ?? "11" },
      { key: "tax_name", value: v.tax_name ?? "PPN" },
      { key: "tax_inclusive", value: v.tax_inclusive ? "true" : "false" },
    ])
  )

  const onReceiptSubmit = receiptForm.handleSubmit((v) =>
    save("receipt", [
      { key: "receipt_header", value: v.receipt_header ?? "" },
      { key: "receipt_footer", value: v.receipt_footer ?? "" },
      {
        key: "receipt_show_cashier",
        value: v.receipt_show_cashier ? "true" : "false",
      },
      {
        key: "receipt_show_customer",
        value: v.receipt_show_customer ? "true" : "false",
      },
    ])
  )

  const onCurrencySubmit = currencyForm.handleSubmit((v) =>
    save("currency", [
      { key: "currency_code", value: v.currency_code ?? "IDR" },
      { key: "currency_symbol", value: v.currency_symbol ?? "Rp" },
    ])
  )

  const onShiftSubmit = shiftForm.handleSubmit((v) =>
    save("shift", [
      { key: "shift_enabled", value: v.shift_enabled ? "true" : "false" },
    ])
  )

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-8">
      {/* Section nav */}
      <nav className="hidden w-48 shrink-0 md:block">
        <ul className="space-y-1">
          {sections.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => setActiveSection(s.key)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  activeSection === s.key
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <s.icon className="size-4 shrink-0" />
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile: horizontal scroll tabs */}
      <div className="flex scrollbar-none gap-1 overflow-x-auto border-b pb-2 md:hidden">
        {sections.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveSection(s.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
              activeSection === s.key
                ? "bg-muted font-medium"
                : "text-muted-foreground hover:bg-muted/60"
            )}
          >
            <s.icon className="size-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {activeSection === "store" && (
          <div data-tour="settings-store">
            <SectionCard
              title="Informasi Toko"
              description="Data toko yang ditampilkan di struk dan laporan."
              loading={loading === "store"}
              onSubmit={onStoreSubmit}
            >
              <div className="space-y-2">
                <Label htmlFor="store_name">Nama Toko</Label>
                <Input
                  id="store_name"
                  placeholder="Manya Store"
                  {...storeForm.register("store_name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store_address">Alamat</Label>
                <textarea
                  id="store_address"
                  placeholder="Jl. Contoh No. 1, Kota"
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  {...storeForm.register("store_address")}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store_phone">Nomor Telepon</Label>
                  <Input
                    id="store_phone"
                    placeholder="08xx-xxxx-xxxx"
                    {...storeForm.register("store_phone")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store_email">Email</Label>
                  <Input
                    id="store_email"
                    type="email"
                    placeholder="toko@email.com"
                    {...storeForm.register("store_email")}
                  />
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeSection === "tax" && (
          <div data-tour="settings-tax">
            <SectionCard
              title="Pajak"
              description="Konfigurasi pajak yang dikenakan pada setiap transaksi."
              loading={loading === "tax"}
              onSubmit={onTaxSubmit}
            >
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Aktifkan Pajak</p>
                  <p className="text-xs text-muted-foreground">
                    Pajak akan dihitung otomatis di setiap transaksi
                  </p>
                </div>
                <Controller
                  control={taxForm.control}
                  name="tax_enabled"
                  render={({ field }) => (
                    <Checkbox
                      id="tax_enabled"
                      checked={field.value}
                      onCheckedChange={(c) => field.onChange(c === true)}
                    />
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tax_name">Nama Pajak</Label>
                  <Input
                    id="tax_name"
                    placeholder="PPN"
                    {...taxForm.register("tax_name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tarif (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.1"
                    {...taxForm.register("tax_rate")}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Controller
                  control={taxForm.control}
                  name="tax_inclusive"
                  render={({ field }) => (
                    <Checkbox
                      id="tax_inclusive"
                      checked={field.value}
                      onCheckedChange={(c) => field.onChange(c === true)}
                    />
                  )}
                />
                <div>
                  <Label htmlFor="tax_inclusive">
                    Pajak inklusif (sudah termasuk dalam harga)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Jika aktif, harga produk sudah termasuk pajak
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeSection === "receipt" && (
          <div data-tour="settings-receipt">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ── Form kiri ── */}
              <SectionCard
                title="Template Struk"
                description="Teks yang ditampilkan di bagian atas dan bawah struk."
                loading={loading === "receipt"}
                onSubmit={onReceiptSubmit}
              >
                <div className="space-y-2">
                  <Label
                    htmlFor="receipt_header"
                    className="flex items-center gap-1"
                  >
                    Header Struk{" "}
                    <FieldHint text="Teks yang muncul di bagian atas struk setelah nama toko. Bisa diisi ucapan selamat datang atau promosi." />
                  </Label>
                  <textarea
                    id="receipt_header"
                    placeholder={
                      "Terima kasih telah berbelanja!\nSemoga puas dengan layanan kami."
                    }
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...receiptForm.register("receipt_header")}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="receipt_footer"
                    className="flex items-center gap-1"
                  >
                    Footer Struk{" "}
                    <FieldHint text="Teks di bagian paling bawah struk. Biasanya berisi kebijakan pengembalian atau ucapan terima kasih." />
                  </Label>
                  <textarea
                    id="receipt_footer"
                    placeholder={
                      "Barang yang sudah dibeli\ntidak dapat dikembalikan."
                    }
                    rows={3}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...receiptForm.register("receipt_footer")}
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Tampilkan di struk</p>
                  <div className="flex items-center gap-3">
                    <Controller
                      control={receiptForm.control}
                      name="receipt_show_cashier"
                      render={({ field }) => (
                        <Checkbox
                          id="receipt_show_cashier"
                          checked={field.value}
                          onCheckedChange={(c) => field.onChange(c === true)}
                        />
                      )}
                    />
                    <Label htmlFor="receipt_show_cashier">Nama kasir</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Controller
                      control={receiptForm.control}
                      name="receipt_show_customer"
                      render={({ field }) => (
                        <Checkbox
                          id="receipt_show_customer"
                          checked={field.value}
                          onCheckedChange={(c) => field.onChange(c === true)}
                        />
                      )}
                    />
                    <Label htmlFor="receipt_show_customer">
                      Nama pelanggan
                    </Label>
                  </div>
                </div>
              </SectionCard>

              {/* ── Preview struk kanan ── */}
              <div>
                <p className="mb-3 text-sm font-medium text-muted-foreground">
                  Preview Struk
                </p>
                <div className="flex justify-center">
                  <div className="w-64 rounded-lg border bg-white p-4 font-mono text-[11px] text-gray-800 shadow-sm dark:bg-gray-950 dark:text-gray-200">
                    {/* Header toko */}
                    <div className="text-center">
                      <p className="text-sm font-bold">
                        {settings.store_name || "Nama Toko"}
                      </p>
                      {settings.store_address && (
                        <p className="mt-0.5 text-[10px] leading-tight whitespace-pre-line text-gray-500">
                          {settings.store_address}
                        </p>
                      )}
                      {settings.store_phone && (
                        <p className="text-[10px] text-gray-500">
                          {settings.store_phone}
                        </p>
                      )}
                    </div>

                    <div className="my-2 border-t border-dashed" />

                    {/* Header custom */}
                    {rcptHeader && (
                      <>
                        <p className="text-center text-[10px] whitespace-pre-line text-gray-500">
                          {rcptHeader}
                        </p>
                        <div className="my-2 border-t border-dashed" />
                      </>
                    )}

                    {/* Info transaksi */}
                    <div className="space-y-0.5 text-[10px]">
                      <div className="flex justify-between">
                        <span>No</span>
                        <span>INV-20241007-0001</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tgl</span>
                        <span>{new Date().toLocaleDateString("id-ID")}</span>
                      </div>
                      {rcptShowCashier && (
                        <div className="flex justify-between">
                          <span>Kasir</span>
                          <span>Siti Rahayu</span>
                        </div>
                      )}
                      {rcptShowCustomer && (
                        <div className="flex justify-between">
                          <span>Pelanggan</span>
                          <span>Budi Santoso</span>
                        </div>
                      )}
                    </div>

                    <div className="my-2 border-t border-dashed" />

                    {/* Items contoh */}
                    <div className="space-y-1 text-[10px]">
                      <div>
                        <p>Nasi Goreng Spesial</p>
                        <div className="flex justify-between pl-2 text-gray-500">
                          <span>2 x Rp 25.000</span>
                          <span>Rp 50.000</span>
                        </div>
                      </div>
                      <div>
                        <p>Kopi Susu</p>
                        <div className="flex justify-between pl-2 text-gray-500">
                          <span>1 x Rp 15.000</span>
                          <span>Rp 15.000</span>
                        </div>
                      </div>
                    </div>

                    <div className="my-2 border-t border-dashed" />

                    {/* Totals */}
                    <div className="space-y-0.5 text-[10px]">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>Rp 65.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PPN 11%</span>
                        <span>Rp 7.150</span>
                      </div>
                      <div className="mt-1 flex justify-between font-bold">
                        <span>TOTAL</span>
                        <span>Rp 72.150</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Tunai</span>
                        <span>Rp 80.000</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Kembalian</span>
                        <span>Rp 7.850</span>
                      </div>
                    </div>

                    <div className="my-2 border-t border-dashed" />

                    {/* Footer custom */}
                    {rcptFooter && (
                      <p className="text-center text-[10px] whitespace-pre-line text-gray-500">
                        {rcptFooter}
                      </p>
                    )}
                    {!rcptFooter && (
                      <p className="text-center text-[10px] text-gray-400 italic">
                        — footer struk —
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "currency" && (
          <SectionCard
            title="Mata Uang"
            description="Format mata uang yang digunakan di seluruh aplikasi."
            loading={loading === "currency"}
            onSubmit={onCurrencySubmit}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="currency_code"
                  className="flex items-center gap-1"
                >
                  Kode Mata Uang{" "}
                  <FieldHint text="Kode ISO 4217, contoh: IDR (Rupiah), USD (Dolar), SGD (Dolar Singapura). Digunakan di laporan ekspor." />
                </Label>
                <Input
                  id="currency_code"
                  placeholder="IDR"
                  {...currencyForm.register("currency_code")}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="currency_symbol"
                  className="flex items-center gap-1"
                >
                  Simbol{" "}
                  <FieldHint text="Simbol yang ditampilkan sebelum angka harga, contoh: Rp, $, S$." />
                </Label>
                <Input
                  id="currency_symbol"
                  placeholder="Rp"
                  {...currencyForm.register("currency_symbol")}
                />
              </div>
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
              Preview:{" "}
              <span className="font-medium text-foreground">
                {settings.currency_symbol || "Rp"} 150.000
              </span>
            </div>
          </SectionCard>
        )}

        {activeSection === "shift" && (
          <SectionCard
            title="Manajemen Shift"
            description="Konfigurasi sistem shift kasir."
            loading={loading === "shift"}
            onSubmit={onShiftSubmit}
          >
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Aktifkan Sistem Shift</p>
                <p className="text-xs text-muted-foreground">
                  Kasir wajib membuka shift sebelum mulai transaksi
                </p>
              </div>
              <Controller
                control={shiftForm.control}
                name="shift_enabled"
                render={({ field }) => (
                  <Checkbox
                    id="shift_enabled"
                    checked={field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                )}
              />
            </div>
          </SectionCard>
        )}

        {activeSection === "security" && (
          <TwoFactorSetup enabled={twoFactorEnabled} />
        )}
      </div>
    </div>
  )
}
