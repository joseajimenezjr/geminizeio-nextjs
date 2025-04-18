"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bluetooth, Settings } from "lucide-react"
import { useBluetooth } from "@/contexts/bluetooth-context"
import { toast } from "@/components/ui/use-toast"

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
  const { isConnected, device: connectedDevice, connectByUUID, isConnecting } = useBluetooth()
  const [connecting, setConnecting] = useState(false)

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
  const handleConnect = async () => {
    if (isThisDeviceConnected() || !device.deviceUUID) {
      return // Already connected or no UUID
    }

    setConnecting(true)
    try {
      const success = await connectByUUID(device.deviceUUID, getDeviceNamePrefix())

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {device.accessoryName}
          {isThisDeviceConnected() && (
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Connected</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Type:</span> {formatDeviceType(device.accessoryType)}
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Location:</span> {device.location}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnect}
          disabled={isThisDeviceConnected() || connecting || isConnecting || !device.deviceUUID}
        >
          <Bluetooth className="h-4 w-4 mr-2" />
          {isThisDeviceConnected()
            ? "Connected"
            : connecting || isConnecting
              ? "Connecting..."
              : device.deviceUUID
                ? "Connect"
                : "No UUID"}
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </CardFooter>
    </Card>
  )
}
