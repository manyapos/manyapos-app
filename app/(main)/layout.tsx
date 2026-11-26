import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Toaster } from "sonner"
import { BottomNav } from "@/components/bottom-nav"
import { LayoutHeader } from "@/components/layout-header"
import { LayoutMain } from "@/components/layout-main"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const userRole = (session.user as { role: string }).role

  return (
    <SidebarProvider>
      <DashboardSidebar userRole={userRole} />
      <SidebarInset>
        <LayoutHeader />
        <LayoutMain>{children}</LayoutMain>
      </SidebarInset>
      <BottomNav userRole={userRole} />
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  )
}
