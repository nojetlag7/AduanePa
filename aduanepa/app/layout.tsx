import type { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getLocale } from "next-intl/server"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const metadata: Metadata = {
  title: "AduanePa",
  description: "AI-powered nutrition and meal recommendations for Ghanaian users",
  applicationName: "AduanePa",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
    shortcut: "/icons/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    title: "AduanePa",
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  themeColor: "#1A5C38",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Read locale + messages server-side so the client provider gets them pre-loaded
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                {children}
                <Toaster richColors closeButton position="top-right" />
              </TooltipProvider>
            </ThemeProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
