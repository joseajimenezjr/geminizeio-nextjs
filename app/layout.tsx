import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { getUserData } from "@/app/actions/user-data"
import { AppProviders } from "@/components/providers/app-providers"
import { PreviewModeRouter } from "@/components/preview-mode-router"
import { PreviewModeInitializer } from "@/components/preview-mode-initializer"

export const metadata: Metadata = {
  title: "Geminize IO",
  description: "Digital Accessory Management for Off-Road Enthusiasts",
  generator: "v0.dev",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get user data at the root level - but don't use headers() here
  let userData
  try {
    // Pass false as default to avoid dynamic server usage
    userData = await getUserData(false)
  } catch (error) {
    console.error("Error getting user data:", error)
    userData = null
  }

  // Get all accessories
  const accessories = userData?.accessories || []

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Favicon-dark-TCRh0L4cFUo5bEkp6OVorSUlogaWFf.png"
          type="image/png"
        />
      </head>
      <body>
        <AppProviders initialAccessories={accessories}>
          <Suspense fallback={null}>
            <PreviewModeRouter />
            {/* Wrap PreviewModeInitializer in Suspense */}
            <Suspense fallback={null}>
              <PreviewModeInitializer />
            </Suspense>
          </Suspense>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
