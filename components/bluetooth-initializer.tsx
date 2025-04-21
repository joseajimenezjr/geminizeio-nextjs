"use client"

import { useEffect } from "react"
import { useBluetoothContext } from "@/contexts/bluetooth-context"
import { initializeBluetoothCommands } from "@/utils/bluetooth-commands"

export function BluetoothInitializer() {
  const bluetoothContext = useBluetoothContext()

  useEffect(() => {
    // Initialize the Bluetooth commands with the context
    initializeBluetoothCommands(bluetoothContext)

    // Clean up on unmount
    return () => {
      if (typeof window !== "undefined") {
        ;(window as any).__bluetoothContext = null
      }
    }
  }, [bluetoothContext])

  // This component doesn't render anything
  return null
}
