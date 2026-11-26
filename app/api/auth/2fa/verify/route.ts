import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verify } from "otplib"

export async function POST(req: Request) {
  const { userId, code } = await req.json() as { userId: string; code: string }
  if (!userId || !code) return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.twoFactorSecret) return NextResponse.json({ error: "2FA tidak dikonfigurasi" }, { status: 400 })

  const valid = verify({ token: code, secret: user.twoFactorSecret })
  if (!valid) return NextResponse.json({ error: "Kode tidak valid" }, { status: 400 })

  return NextResponse.json({ ok: true })
}
