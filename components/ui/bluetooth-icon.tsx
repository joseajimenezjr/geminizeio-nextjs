import { cn } from "@/lib/utils"
import { Bluetooth, BluetoothOff, BluetoothSearching } from "lucide-react"

interface BluetoothIconProps {
  isConnected: boolean
  isConnecting: boolean
  className?: string
}

export function BluetoothIcon({ isConnected, isConnecting, className }: BluetoothIconProps) {
  if (isConnecting) {
    return <BluetoothSearching className={cn("animate-pulse", className)} />
  }

  if (isConnected) {
    return <Bluetooth className={className} />
  }

  return <BluetoothOff className={className} />
}
