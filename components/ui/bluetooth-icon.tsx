"use client"

import { Bluetooth } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBluetooth } from "@/contexts/bluetooth-context"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface BluetoothIconProps {
  className?: string
  size?: number
}

export function BluetoothIcon({ className, size = 4 }: BluetoothIconProps) {
  const { isConnected, isConnecting, bluetoothStatus, connectToDevice } = useBluetooth()
  const [hubDevice, setHubDevice] = useState<any>(null)
  const supabase = createClientComponentClient()

  // Fetch hub details
  useEffect(() => {
    const fetchHubDetails = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) return

        const { data: profileData, error } = await supabase
          .from("Profiles")
          .select("hubDetails")
          .eq("id", sessionData.session.user.id)
          .single()

        if (error || !profileData?.hubDetails) return

        const device = profileData.hubDetails.find(
          (device: any) => device.deviceType === "hub" || device.deviceType === "relay_hub",
        )

        if (device) {
          setHubDevice(device)
        }
      } catch (error) {
        console.error("Error fetching hub details:", error)
      }
    }

    fetchHubDetails()
  }, [supabase])

  // Handle click on the Bluetooth icon
  const handleClick = () => {
    if (!isConnected && !isConnecting && bluetoothStatus.available && hubDevice?.deviceName && hubDevice?.serviceName) {
      connectToDevice(hubDevice.deviceName, hubDevice.serviceName)
    }
  }

  // Determine the icon's appearance based on connection state
  const iconClasses = cn(
    `h-${size} w-${size}`,
    isConnected ? "text-green-500" : !bluetoothStatus.available ? "text-muted-foreground" : "text-yellow-500",
    !isConnected && !isConnecting && bluetoothStatus.available && "animate-pulse cursor-pointer",
    className,
  )

  return (
    <Bluetooth
      className={iconClasses}
      onClick={handleClick}
      role="button"
      aria-label={isConnected ? "Bluetooth connected" : "Connect to Bluetooth device"}
      title={isConnected ? "Bluetooth connected" : "Click to connect Bluetooth device"}
    />
  )
}
