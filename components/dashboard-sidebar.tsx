"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import {
  LayoutDashboard, ShoppingCart, Package, Tags, Users, Receipt,
  Warehouse, BarChart3, Wallet, Settings, LogOut, UserCircle,
  TrendingUp, Clock, Truck, ShoppingBag, PieChart, UserCheck, ChevronRight,
  Bell, Tag,
} from "lucide-react"
import { Logo } from "@/components/logo"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton,
  SidebarMenuSubItem, SidebarGroup, SidebarGroupLabel, SidebarRail,
} from "@/components/ui/sidebar"

const mainNav = [
  { href: "/dashboard",              label: "Dashboard",   icon: LayoutDashboard, exact: true, tour: "dashboard-link" },
  { href: "/pos",                    label: "POS / Kasir", icon: ShoppingCart,    exact: true, tour: "pos-link" },
  { href: "/dashboard/products",     label: "Produk",      icon: Package,         tour: "products-link" },
  { href: "/dashboard/categories",   label: "Kategori",    icon: Tags },
  { href: "/dashboard/customers",    label: "Pelanggan",   icon: UserCircle },
  { href: "/dashboard/transactions", label: "Transaksi",   icon: Receipt },
]

const stockNav = [
  { href: "/dashboard/inventory", label: "Inventori", icon: Warehouse, tour: "inventory-link" },
  { href: "/dashboard/suppliers", label: "Supplier",  icon: Truck },
  { href: "/dashboard/purchases", label: "Pembelian", icon: ShoppingBag },
]

const reportSubs = [
  { href: "/dashboard/reports",            label: "Ringkasan", icon: BarChart3 },
  { href: "/dashboard/reports/products",   label: "Produk",    icon: Package },
  { href: "/dashboard/reports/categories", label: "Kategori",  icon: PieChart },
  { href: "/dashboard/reports/cashiers",   label: "Kasir",     icon: UserCheck },
  { href: "/dashboard/reports/profit",     label: "Laba Rugi", icon: TrendingUp },
]

const opsNav = [
  { href: "/dashboard/shifts",        label: "Shift",         icon: Clock },
  { href: "/dashboard/expenses",      label: "Pengeluaran",   icon: Wallet },
  { href: "/dashboard/discounts",     label: "Diskon & Promo", icon: Tag },
  { href: "/dashboard/notifications", label: "Notifikasi",    icon: Bell },
]

const adminNav = [
  { href: "/dashboard/users",    label: "Pengguna",   icon: Users },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
]

function NavItem({ href, label, icon: Icon, exact = false, tour }: {
  href: string; label: string; icon: React.ElementType; exact?: boolean; tour?: string
}) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={href} />}
        isActive={active}
        tooltip={label}
        {...(tour ? { "data-tour": tour } : {})}
      >
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function DashboardSidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  const reportsActive = pathname.startsWith("/dashboard/reports")
  const [reportsOpen, setReportsOpen] = useState(reportsActive)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
                <Logo size={16} />
              </div>
              <span className="font-heading font-bold text-sm text-sidebar-foreground">Manya POS</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent data-tour="sidebar">
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarMenu>
            {mainNav.map((item) => <NavItem key={item.href} {...item} />)}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Inventori</SidebarGroupLabel>
          <SidebarMenu>
            {stockNav.map((item) => <NavItem key={item.href} {...item} />)}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Laporan</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                data-tour="reports-link"
                isActive={reportsActive}
                tooltip="Laporan"
                onClick={() => setReportsOpen((o) => !o)}
              >
                <BarChart3 />
                <span>Laporan</span>
                <ChevronRight className={`ml-auto transition-transform duration-200 ${reportsOpen ? "rotate-90" : ""}`} />
              </SidebarMenuButton>
              {reportsOpen && (
                <SidebarMenuSub>
                  {reportSubs.map((item) => (
                    <SidebarMenuSubItem key={item.href}>
                      <SidebarMenuSubButton
                        render={<Link href={item.href} />}
                        isActive={pathname === item.href}
                      >
                        <item.icon className="size-3.5" />
                        <span>{item.label}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operasional</SidebarGroupLabel>
          <SidebarMenu>
            {opsNav.map((item) => <NavItem key={item.href} {...item} />)}
            {userRole === "ADMIN" && adminNav.map((item) => <NavItem key={item.href} {...item} />)}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              tooltip="Keluar"
            >
              <LogOut />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
