import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateSecret, generateURI, verify } from "otplib"
import QRCode from "qrcode"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const secret = generateSecret()
  const otpauth = generateURI({ issuer: "Manya POS", label: session.user.email!, secret })
  const qrDataUrl = await QRCode.toDataURL(otpauth)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: secret },
  })

  return NextResponse.json({ secret, qrDataUrl })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { code, action } = await req.json() as { code: string; action: string }

  if (action === "disable") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    })
    return NextResponse.json({ ok: true })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.twoFactorSecret) return NextResponse.json({ error: "Setup 2FA dulu" }, { status: 400 })

  const valid = verify({ token: code, secret: user.twoFactorSecret })
  if (!valid) return NextResponse.json({ error: "Kode tidak valid" }, { status: 400 })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: true },
  })

  return NextResponse.json({ ok: true })
}
