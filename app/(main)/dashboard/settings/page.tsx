import { getSettings } from "@/lib/actions"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "@/components/settings/settings-form"
import { PageTitle } from "@/components/ui/page-title"

export default async function SettingsPage() {
  const [settings, session] = await Promise.all([getSettings(), auth()])
  const userId = session?.user?.id
  const user = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { twoFactorEnabled: true } }) : null

  return (
    <div className="space-y-6">
      <PageTitle title="Pengaturan" description="Konfigurasi toko: nama, logo, pajak, format struk, loyalitas, dan fitur aktif." />
      <SettingsForm settings={settings} twoFactorEnabled={user?.twoFactorEnabled ?? false} />
    </div>
  )
}
