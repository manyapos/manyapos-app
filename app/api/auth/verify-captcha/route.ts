import { NextResponse } from "next/server"
import { verifyCaptcha } from "@/lib/captcha"

export async function POST(req: Request) {
  const { token, answer } = await req.json()
  if (!token || !answer) return NextResponse.json({ error: "Missing" }, { status: 400 })

  const valid = await verifyCaptcha(token, answer)
  if (!valid) return NextResponse.json({ error: "Invalid captcha" }, { status: 400 })

  return NextResponse.json({ ok: true })
}
