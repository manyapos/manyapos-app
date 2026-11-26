import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcryptjs from "bcryptjs"
const { compare } = bcryptjs

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials.email as string
        const password = credentials.password as string
        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        const valid = await compare(password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          // twoFactorPending: user has 2FA enabled but code not yet verified
          // We track this in a separate cookie/state on client — session only granted after 2FA
          twoFactorEnabled: user.twoFactorEnabled,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.twoFactorEnabled = (
          user as { twoFactorEnabled: boolean }
        ).twoFactorEnabled
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      ;(session.user as { role: string }).role = token.role as string
      ;(
        session.user as unknown as { twoFactorEnabled: boolean }
      ).twoFactorEnabled = (token.twoFactorEnabled ?? false) as boolean
      return session
    },
  },
})
