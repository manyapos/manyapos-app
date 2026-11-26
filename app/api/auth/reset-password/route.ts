import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"

export async function POST(req: Request) {
  const { token, password } = await req.json()
  if (!token || !password) return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 })

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiry: { gt: new Date() },
    },
  })

  if (!user) return NextResponse.json({ error: "Token tidak valid atau sudah kadaluarsa" }, { status: 400 })

  const hashed = await bcryptjs.hash(password, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, passwordResetToken: null, passwordResetExpiry: null },
  })

  return NextResponse.json({ ok: true })
}
