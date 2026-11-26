import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret")

export async function verifyCaptcha(token: string, answer: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.answer === answer.toLowerCase()
  } catch {
    return false
  }
}
