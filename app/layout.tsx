import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DeviceProvider } from "@/contexts/device-context"
import { BluetoothProvider } from "@/contexts/bluetooth-context"
import { BluetoothInitializer } from "@/components/bluetooth-initializer"
import { PreviewModeRouter } from "@/components/preview-mode-router"
import { HashAuthHandler } from "@/components/hash-auth-handler"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Geminize.io",
  description: "Control your IoT devices with ease",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <BluetoothProvider>
            <DeviceProvider initialAccessories={[]}>
              <BluetoothInitializer />
              <HashAuthHandler />
              <PreviewModeRouter>{children}</PreviewModeRouter>
            </DeviceProvider>
          </BluetoothProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
