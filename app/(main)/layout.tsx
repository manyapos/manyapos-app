import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/breadcrumb"
import { ProductTour } from "@/components/product-tour"
import { Toaster } from "sonner"
import { BottomNav } from "@/components/bottom-nav"

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
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1 hidden md:flex" />
          <Separator orientation="vertical" className="hidden h-4 md:block" />
          <Breadcrumb />
          <div className="ml-auto">
            <ProductTour autoStart />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-3 pb-20 sm:p-6 md:pb-6">
          {children}
        </main>
      </SidebarInset>
      <BottomNav userRole={userRole} />
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  )
}
