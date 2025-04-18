"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bluetooth } from "lucide-react"
import { useBluetooth } from "@/contexts/bluetooth-context"

export function BluetoothNavButton() {
  const { isConnected, connectToDevice, disconnectDevice } = useBluetooth()
  const [isFlashing, setIsFlashing] = useState(false)

  // Service UUID for connection
  const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"

  // Toggle flashing effect when disconnected
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(() => {
        setIsFlashing((prev) => !prev)
      }, 500)
      return () => clearInterval(interval)
    } else {
      setIsFlashing(false)
    }
  }, [isConnected])

  const handleClick = async () => {
    if (isConnected) {
      await disconnectDevice()
    } else {
      try {
        await connectToDevice(undefined, SERVICE_UUID)
      } catch (error) {
        console.error("Failed to connect:", error)
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`${isFlashing && !isConnected ? "animate-pulse bg-yellow-500/20" : ""} rounded-full`}
      title={isConnected ? "Bluetooth Connected" : "Bluetooth Disconnected"}
    >
      <Bluetooth className={`h-5 w-5 ${isConnected ? "text-blue-500" : "text-yellow-500"}`} />
    </Button>
  )
}
