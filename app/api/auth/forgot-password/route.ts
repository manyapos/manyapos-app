import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: Request) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email } })

  // Always return success to not leak whether email exists
  if (!user) return NextResponse.json({ ok: true })

  const token = crypto.randomBytes(32).toString("hex")
  const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpiry: expiry },
  })

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  await sendPasswordResetEmail(user.email, user.name, resetUrl)

  return NextResponse.json({ ok: true })
}
