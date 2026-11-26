import { prisma } from "@/lib/prisma"
import { PageTitle } from "@/components/ui/page-title"
import { NotificationsClient } from "@/components/notifications/notifications-client"

export default async function NotificationsPage() {
  // Auto-generate low stock notifications on page load
  const lowStockProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, stock: true, minStock: true, unit: true },
  }).then(ps => ps.filter(p => p.stock <= p.minStock))

  // Create notifications for low stock that don't already have one (unread)
  for (const p of lowStockProducts) {
    const exists = await prisma.notification.findFirst({
      where: { type: "low_stock", message: { contains: p.name }, isRead: false },
    })
    if (!exists) {
      await prisma.notification.create({
        data: { type: "low_stock", message: `Stok ${p.name} rendah: ${p.stock} ${p.unit} (min ${p.minStock})` },
      })
    }
  }

  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-4">
      <PageTitle title="Notifikasi" description="Peringatan stok rendah, pengingat shift, dan notifikasi sistem lainnya." />
      <NotificationsClient notifications={notifications} />
    </div>
  )
}
