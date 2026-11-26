import { prisma } from "@/lib/prisma"
import { UserList } from "@/components/users/user-list"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return (
    <UserList users={users} />
  )
}
