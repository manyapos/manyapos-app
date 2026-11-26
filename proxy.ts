import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/reset-password")
  ) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", req.url))
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Admin-only routes
  const adminRoutes = ["/dashboard/users"]
  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    const role = req.auth?.user && (req.auth.user as { role: string }).role
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Cashier-only restriction: block dashboard for pure CASHIER
  const dashboardRoutes = ["/dashboard"]
  if (dashboardRoutes.some((r) => pathname.startsWith(r))) {
    const role = req.auth?.user && (req.auth.user as { role: string }).role
    if (role === "CASHIER") {
      return NextResponse.redirect(new URL("/pos", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
