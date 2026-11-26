import { NextResponse } from "next/server"
import svgCaptcha from "svg-captcha"
import { SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret")

export async function GET() {
  const captcha = svgCaptcha.createMathExpr({
    mathMin: 1,
    mathMax: 20,
    mathOperator: "+",
    noise: 2,
    color: true,
    background: "#f4f4f5",
  })

  const token = await new SignJWT({ answer: captcha.text.toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("5m")
    .sign(secret)

  return NextResponse.json({ svg: captcha.data, token })
}
