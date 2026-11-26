"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/breadcrumb"
import { ProductTour } from "@/components/product-tour"

export function LayoutHeader() {
  return (
    <header className="flex h-12 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1 hidden md:flex" />
      <Separator orientation="vertical" className="hidden h-4 md:block" />
      <Breadcrumb />
      <div className="ml-auto">
        <ProductTour />
      </div>
    </header>
  )
}
