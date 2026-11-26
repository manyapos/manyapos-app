import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/breadcrumb"
import { ProductTour } from "@/components/product-tour"
import { Toaster } from "sonner"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <SidebarProvider>
      <DashboardSidebar userRole={(session.user as { role: string }).role} />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb />
          <div className="ml-auto">
            <ProductTour autoStart />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</main>
      </SidebarInset>
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  )
}
