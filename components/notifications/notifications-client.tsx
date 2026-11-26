"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Bell, BellOff, CheckCheck, Trash2, AlertTriangle, Info, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from "@/lib/actions"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

type Notif = { id: string; type: string; message: string; isRead: boolean; createdAt: Date }

const TYPE_ICON: Record<string, React.ReactNode> = {
  low_stock: <AlertTriangle className="size-4 text-amber-500" />,
  shift_end: <BellOff className="size-4 text-blue-500" />,
  new_order: <Bell className="size-4 text-green-500" />,
  large_transaction: <DollarSign className="size-4 text-emerald-500" />,
}

export function NotificationsClient({ notifications }: { notifications: Notif[] }) {
  const router = useRouter()
  const unread = notifications.filter(n => !n.isRead).length

  async function handleRead(id: string) {
    await markNotificationRead(id)
    router.refresh()
  }

  async function handleReadAll() {
    await markAllNotificationsRead()
    toast.success("Semua notifikasi ditandai sudah dibaca")
    router.refresh()
  }

  async function handleDelete(id: string) {
    await deleteNotification(id)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground" data-tour="notif-count">
          {unread > 0 ? <><span className="font-medium text-foreground">{unread}</span> belum dibaca</> : "Semua sudah dibaca"}
        </p>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleReadAll}>
            <CheckCheck className="size-4 mr-1.5" />Tandai Semua Dibaca
          </Button>
        )}
      </div>

      <div className="space-y-2" data-tour="notif-list">
        {notifications.length === 0 && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <Info className="size-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Tidak ada notifikasi</p>
          </CardContent></Card>
        )}
        {notifications.map(n => (
          <Card key={n.id} className={!n.isRead ? "border-primary/30 bg-primary/5" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{TYPE_ICON[n.type] ?? <Info className="size-4 text-muted-foreground" />}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.isRead ? "font-medium" : "text-muted-foreground"}`}>{n.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: id })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <Button size="icon" variant="ghost" className="size-7" onClick={() => handleRead(n.id)} title="Tandai dibaca">
                      <CheckCheck className="size-3.5" />
                    </Button>
                  )}
                  <Badge variant="outline" className="text-xs capitalize">{n.type.replace("_", " ")}</Badge>
                  <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => handleDelete(n.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
