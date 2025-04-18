"use client"

import type { ReactNode } from "react"
import { DeviceProvider } from "@/contexts/device-context"
import { ThemeProvider } from "@/components/theme-provider"
import { BluetoothProvider } from "@/contexts/bluetooth-context"
import { AuthProvider } from "@/contexts/auth-store"
import { checkReactImports } from "@/utils/debug-imports"

interface AppProvidersProps {
  children: ReactNode
  initialAccessories: any[]
}

export function AppProviders({ children, initialAccessories }: AppProvidersProps) {
  if (process.env.NODE_ENV === "development") {
    checkReactImports()
  }
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <AuthProvider>
        <BluetoothProvider>
          <DeviceProvider initialAccessories={initialAccessories}>{children}</DeviceProvider>
        </BluetoothProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
