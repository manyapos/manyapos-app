import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 })
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: await bcryptjs.hash(password, 10),
      role: "CASHIER",
    },
  })

  return NextResponse.json({ ok: true })
}
