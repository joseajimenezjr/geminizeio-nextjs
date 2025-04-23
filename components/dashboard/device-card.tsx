"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bluetooth, Settings, BluetoothOff } from "lucide-react"
import { useBluetooth } from "@/contexts/bluetooth-context"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"
import { Check } from "lucide-react"

interface DeviceCardProps {
  device: {
    accessoryID: string
    accessoryName: string
    accessoryType: string
    location: string
    deviceUUID?: string
    accessoryConnectionStatus: boolean
    isFavorite: boolean
  }
}

export function DeviceCard({ device }: DeviceCardProps) {
  const {
    isConnected,
    isConnecting,
    bluetoothStatus,
    connectToDevice,
    disconnectDevice,
    sendCommand,
    connectedDevice,
  } = useBluetooth()
  const [connecting, setConnecting] = useState(false)
  const connectButtonRef = useRef<HTMLButtonElement>(null)
  const hubDevice = { deviceName: "Example Hub" } // Example value, replace with actual data source

  // Format the device type for display
  const formatDeviceType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get the device name prefix based on device type
  const getDeviceNamePrefix = () => {
    switch (device.accessoryType) {
      case "relay_hub":
        return "geminize_relay_hub_"
      case "hub":
        return "geminize_hub_"
      case "accessory":
        return "geminize_accessory_"
      case "turn_signal":
        return "geminize_turn_signal_kit_"
      default:
        return "geminize_"
    }
  }

  // Check if this device is currently connected
  const isThisDeviceConnected = () => {
    return (
      device.accessoryConnectionStatus ||
      (isConnected && device.deviceUUID && connectedDevice?.name?.includes(getDeviceNamePrefix()))
    )
  }

  // Connect to this device
  const handleConnectClick = async () => {
    if (isThisDeviceConnected() || !device.deviceUUID) {
      return // Already connected or no UUID
    }

    setConnecting(true)
    try {
      const success = await connectToDevice(device.deviceUUID, getDeviceNamePrefix())

      if (!success) {
        toast({
          title: "Connection failed",
          description: "Could not connect to the device. Make sure it's powered on and in range.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error connecting to device:", error)
      toast({
        title: "Connection error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setConnecting(false)
    }
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300 bg-gradient-to-br border-none shadow-md overflow-hidden h-full",
        isConnected
          ? "from-green-500/10 to-green-600/5 border-green-500/20"
          : !bluetoothStatus.available
            ? "from-amber-50/30 to-amber-100/10 dark:from-amber-950/10 dark:to-amber-900/5"
            : isConnecting
              ? "from-background to-muted/30"
              : "from-yellow-500/20 to-yellow-600/10 border-yellow-500/20 animate-pulse-very-slow",
      )}
    >
      <CardContent className="p-4 flex items-center justify-between h-full">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">BLUETOOTH CONNECTION</p>
          <p className="text-2xl font-bold flex items-center gap-2">
            {isConnected ? (
              <>
                <span className="text-green-500">Connected</span>
                <Check className="h-5 w-5 text-green-500" />
              </>
            ) : (
              <span className={isConnecting ? "" : "text-yellow-500"}>Not Connected</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Device: {hubDevice?.deviceName || "Not specified"}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            ref={connectButtonRef}
            variant={isConnected ? "outline" : "default"}
            size="sm"
            onClick={handleConnectClick}
            disabled={isConnecting}
            className={cn(
              "min-w-[130px]",
              isConnected ? "border-green-300" : "bg-yellow-500 hover:bg-yellow-600 text-black",
            )}
          >
            {isConnecting ? (
              <>
                <Bluetooth className="h-4 w-4 mr-2 animate-pulse" />
                Connecting...
              </>
            ) : isConnected ? (
              <>
                <BluetoothOff className="h-4 w-4 mr-2" />
                Disconnect
              </>
            ) : (
              <>
                <Bluetooth className="h-4 w-4 mr-2" />
                Connect
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default DeviceCard
