"use client"

import type { ReactNode } from "react"
import { DeviceProvider } from "@/contexts/device-context"
import { ThemeProvider } from "@/components/theme-provider"
import { BluetoothProvider } from "@/contexts/bluetooth-context"

interface AppProvidersProps {
  children: ReactNode
  initialAccessories: any[]
}

export function AppProviders({ children, initialAccessories }: AppProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <BluetoothProvider>
        <DeviceProvider initialAccessories={initialAccessories}>{children}</DeviceProvider>
      </BluetoothProvider>
    </ThemeProvider>
  )
}

