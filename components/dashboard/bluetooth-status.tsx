"use client"

import { Bluetooth, BluetoothOff, BluetoothSearching } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBluetooth } from "@/contexts/bluetooth-context"
import { cn } from "@/lib/utils"

export function BluetoothStatus() {
  const { isConnected, disconnect, isConnecting } = useBluetooth()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className={cn("relative", isConnected ? "text-blue-500 border-blue-500" : "text-muted-foreground")}
        onClick={isConnected ? disconnect : undefined}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <BluetoothSearching className="h-4 w-4 animate-pulse" />
        ) : isConnected ? (
          <Bluetooth className="h-4 w-4" />
        ) : (
          <BluetoothOff className="h-4 w-4" />
        )}
        {isConnected && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500" />}
      </Button>
      <span className="text-sm font-medium">
        {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  )
}
