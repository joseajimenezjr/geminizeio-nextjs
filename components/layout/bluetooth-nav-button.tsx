"use client"

import { Button } from "@/components/ui/button"
import { useBluetoothContext } from "@/contexts/bluetooth-context"
import { useState } from "react"
import { BluetoothIcon } from "@/components/ui/bluetooth-icon"

export function BluetoothNavButton() {
  const { isConnected, isConnecting, connectToDevice, disconnectFromDevice } = useBluetoothContext()
  const [isAttemptingConnect, setIsAttemptingConnect] = useState(false)

  const handleClick = async () => {
    if (isConnected) {
      await disconnectFromDevice()
    } else {
      setIsAttemptingConnect(true)
      try {
        await connectToDevice()
      } catch (error) {
        console.error("Failed to connect:", error)
      } finally {
        setIsAttemptingConnect(false)
      }
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={isConnecting || isAttemptingConnect}
      title={isConnected ? "Disconnect Bluetooth" : "Connect Bluetooth"}
    >
      <BluetoothIcon isConnected={isConnected} isConnecting={isConnecting || isAttemptingConnect} />
    </Button>
  )
}
