"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Bluetooth } from "lucide-react"
import { useBluetooth } from "@/contexts/bluetooth-context"
import { getUserData } from "@/app/actions/user-data"

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
        // Fetch user data to get hub details
        console.log("Fetching user data...")
        const userData = await getUserData()
        console.log("User data received:", userData)

        // Check if user has hub details
        let deviceName = undefined

        if (userData?.hubDetails) {
          console.log("Hub details found:", userData.hubDetails)

          // Check if hubDetails is an array
          if (Array.isArray(userData.hubDetails)) {
            console.log("Hub details is an array with", userData.hubDetails.length, "items")

            // Loop through the array to find a device with deviceType = "relay_hub"
            const relayHub = userData.hubDetails.find((hub) => hub.deviceType === "relay_hub")

            if (relayHub) {
              console.log("Found relay hub:", relayHub)
              deviceName = relayHub.deviceName
              console.log(`Using relay hub device name: ${deviceName}`)
            } else {
              console.log("No relay hub found in hubDetails array")
            }
          } else {
            // If it's a single object (not an array)
            console.log("Hub details is a single object")
            if (userData.hubDetails.deviceType === "relay_hub") {
              deviceName = userData.hubDetails.deviceName
              console.log(`Found relay hub device name: ${deviceName}`)
            }
          }
        } else {
          console.log("No hub details found in user data")
        }

        // Connect to the device, using the specific name if available
        console.log(`Connecting to device: ${deviceName || "any"}`)
        await connectToDevice(deviceName, SERVICE_UUID)
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
