"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ShoppingCart, Package, Receipt, Menu,
  Warehouse, Truck, ShoppingBag, BarChart3, Clock, Wallet,
  Tag, Bell, Users, Settings, LogOut, UserCircle, Tags,
} from "lucide-react"
import { cn } from "cn"
import { useState } from "react"
import { signOut } from "next-auth/react"

const primaryItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/pos", label: "Kasir", icon: ShoppingCart, exact: true },
  { href: "/dashboard/products", label: "Produk", icon: Package },
  { href: "/dashboard/transactions", label: "Transaksi", icon: Receipt },
]

const moreItems = [
  { href: "/dashboard/categories", label: "Kategori", icon: Tags },
  { href: "/dashboard/customers", label: "Pelanggan", icon: UserCircle },
  { href: "/dashboard/inventory", label: "Inventori", icon: Warehouse },
  { href: "/dashboard/suppliers", label: "Supplier", icon: Truck },
  { href: "/dashboard/purchases", label: "Pembelian", icon: ShoppingBag },
  { href: "/dashboard/reports", label: "Laporan", icon: BarChart3 },
  { href: "/dashboard/shifts", label: "Shift", icon: Clock },
  { href: "/dashboard/expenses", label: "Pengeluaran", icon: Wallet },
  { href: "/dashboard/discounts", label: "Diskon", icon: Tag },
  { href: "/dashboard/notifications", label: "Notifikasi", icon: Bell },
]

const adminItems = [
  { href: "/dashboard/users", label: "Pengguna", icon: Users },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")
}

export function BottomNav({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const moreIsActive = [...moreItems, ...(userRole === "ADMIN" ? adminItems : [])].some(
    (item) => isActive(pathname, item.href)
  )

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* More menu panel */}
      {open && (
        <div className="fixed bottom-16 left-0 right-0 z-50 mx-2 mb-1 rounded-xl border bg-background p-3 shadow-lg md:hidden max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {moreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-muted-foreground transition-colors",
                  isActive(pathname, item.href) && "bg-primary/10 text-primary font-medium"
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            ))}
            {userRole === "ADMIN" &&
              adminItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-muted-foreground transition-colors",
                    isActive(pathname, item.href) && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              ))}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex flex-col items-center gap-1 rounded-lg p-2 text-xs text-destructive transition-colors"
            >
              <LogOut className="size-5" />
              Keluar
            </button>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
        <div className="flex items-center justify-around h-16">
          {primaryItems.map((item) => {
            const active = isActive(pathname, item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] text-muted-foreground transition-colors",
                  active && "text-primary font-medium"
                )}
              >
                <item.icon className={cn("size-5", active && "stroke-[2.5]")} />
                {item.label}
              </Link>
            )
          })}
          <button
            onClick={() => setOpen((o) => !o)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] text-muted-foreground transition-colors",
              moreIsActive && "text-primary font-medium"
            )}
          >
            <Menu className={cn("size-5", moreIsActive && "stroke-[2.5]")} />
            Lainnya
          </button>
        </div>
      </nav>
    </>
  )
}
