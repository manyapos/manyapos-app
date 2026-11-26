import { Geist, Geist_Mono, Nunito_Sans, Montserrat, Raleway, Inter } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TopLoader } from "@/components/top-loader"
import { RegisterSW } from "@/components/register-sw"
import { cn } from "@/lib/utils"

const geistHeading = Geist({subsets:['latin'],variable:'--font-heading'})
const inter = Inter({subsets:['latin'],variable:'--font-sans'})
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "Manya POS",
  description: "Point of Sale System",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Manya POS",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#6366f1",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        geistHeading.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TopLoader />
          {children}
        </ThemeProvider>
        <RegisterSW />
      </body>
    </html>
  )
}
