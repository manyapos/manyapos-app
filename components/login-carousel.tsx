"use client"

import useEmblaCarousel from "embla-carousel-react"
import { useEffect, useState, useCallback } from "react"
import { Logo } from "@/components/logo"
import { cn } from "cn"
import { ShoppingCart, BarChart3, Package, Users, TrendingUp, Zap, ShieldCheck, Receipt } from "lucide-react"

const slides = [
  {
    icon: Zap,
    tag: "Transaksi Cepat",
    headline: "Proses pembayaran\nin seconds",
    desc: "Interface kasir yang intuitif. Scan barcode, pilih produk, cetak struk — semua dalam hitungan detik.",
    stats: [
      { value: "3x", label: "Lebih cepat dari kasir manual" },
      { value: "<2s", label: "Waktu rata-rata per item" },
    ],
  },
  {
    icon: BarChart3,
    tag: "Laporan Lengkap",
    headline: "Analitik bisnis\nreal-time",
    desc: "Dashboard grafik penjualan, laporan laba rugi, performa kasir, dan export PDF/CSV.",
    stats: [
      { value: "10+", label: "Jenis laporan tersedia" },
      { value: "PDF", label: "& CSV export siap pakai" },
    ],
  },
  {
    icon: Package,
    tag: "Manajemen Stok",
    headline: "Stok terkontrol,\nbisnis lancar",
    desc: "Alert otomatis saat stok hampir habis. Catat barang masuk, penyesuaian, dan riwayat mutasi.",
    stats: [
      { value: "Auto", label: "Alert stok rendah" },
      { value: "100%", label: "Riwayat mutasi tercatat" },
    ],
  },
  {
    icon: Users,
    tag: "Loyalitas Pelanggan",
    headline: "Pelanggan loyal,\nrevenue naik",
    desc: "Sistem poin otomatis, tier Regular–Platinum, dan riwayat transaksi per pelanggan.",
    stats: [
      { value: "4", label: "Tier pelanggan" },
      { value: "Poin", label: "Redeem saat transaksi" },
    ],
  },
  {
    icon: ShieldCheck,
    tag: "Aman & Terpercaya",
    headline: "Data bisnis Anda\naman bersama kami",
    desc: "Role-based access, 2FA, audit trail transaksi, dan manajemen shift kasir terintegrasi.",
    stats: [
      { value: "3", label: "Level akses pengguna" },
      { value: "2FA", label: "Autentikasi dua faktor" },
    ],
  },
]

export function LoginCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const id = setInterval(() => emblaApi.scrollNext(), 4500)
    return () => clearInterval(id)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on("select", () => setCurrent(emblaApi.selectedScrollSnap()))
  }, [emblaApi])

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  return (
    <div className="relative flex h-full flex-col bg-primary text-primary-foreground overflow-hidden select-none">
      {/* Artistic background layers */}
      {/* Large blurred circle top-right */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl" />
      {/* Small circle bottom-left */}
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-primary-foreground/10 blur-2xl" />
      {/* Subtle dot grid */}
      <div className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, oklch(1 0 0 / 0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Diagonal lines accent — top-left corner */}
      <svg className="pointer-events-none absolute top-0 left-0 h-48 w-48 opacity-10" viewBox="0 0 200 200" fill="none">
        {[0,1,2,3,4,5,6,7].map(i => (
          <line key={i} x1={i*28-40} y1="0" x2={i*28+160} y2="200" stroke="currentColor" strokeWidth="1" />
        ))}
      </svg>
      {/* Diagonal lines accent — bottom-right corner */}
      <svg className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 opacity-10" viewBox="0 0 200 200" fill="none">
        {[0,1,2,3,4,5,6,7].map(i => (
          <line key={i} x1={i*28-40} y1="0" x2={i*28+160} y2="200" stroke="currentColor" strokeWidth="1" />
        ))}
      </svg>
      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5 p-8">
        <Logo size={26} className="opacity-90" />
        <span className="text-base font-bold font-heading tracking-tight opacity-90">Manya POS</span>
      </div>

      {/* Slides */}
      <div className="relative z-10 flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((s, i) => (
            <div key={i} className="min-w-full flex flex-col justify-center px-10 pb-4">
              {/* Icon + tag */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/15">
                  <s.icon className="size-5" />
                </div>
                <span className="rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-0.5 text-xs font-medium opacity-80">
                  {s.tag}
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-4xl font-bold leading-tight tracking-tight whitespace-pre-line">
                {s.headline}
              </h2>

              {/* Desc */}
              <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-60">
                {s.desc}
              </p>

              {/* Stats */}
              <div className="mt-8 flex gap-4">
                {s.stats.map((st) => (
                  <div key={st.label} className="flex-1 rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 p-4">
                    <p className="text-2xl font-bold">{st.value}</p>
                    <p className="mt-0.5 text-xs opacity-50">{st.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="relative z-10 px-10 pb-10 space-y-5">
        {/* Dots */}
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === current ? "w-6 bg-primary-foreground" : "w-1.5 bg-primary-foreground/25 hover:bg-primary-foreground/40"
              )}
            />
          ))}
        </div>

        {/* Footnotes */}
        <div className="flex gap-5 text-xs opacity-30">
          {[
            { icon: Receipt, label: "Struk thermal" },
            { icon: TrendingUp, label: "Laba rugi" },
            { icon: ShoppingCart, label: "Multi kasir" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="size-3" />{label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
