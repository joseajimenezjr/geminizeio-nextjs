"use client"

import { useState, useEffect } from "react"
import { ControlCenterV2 } from "@/components/control-center-v2/control-center"
import { DashboardHeaderWrapper } from "@/components/dashboard/dashboard-header-wrapper"
import { BottomNav } from "@/components/layout/bottom-nav"
import { AutoConnectHandler } from "@/components/dashboard/auto-connect-handler"
import { getUserData } from "@/app/actions/user-data"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { AddDeviceFlow } from "@/components/add-device/add-device-flow"

interface LastAddedDevice {
  type: string
  name: string
  timestamp: string
}

export default function ControlCenterV2Page() {
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDeviceFlow, setShowAddDeviceFlow] = useState(false)
  const [lastAddedDevice, setLastAddedDevice] = useState<LastAddedDevice | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getUserData()
        setUserData(data)

        // Check for last added device in localStorage
        const storedDevice = localStorage.getItem("lastAddedDevice")
        if (storedDevice) {
          const parsedDevice = JSON.parse(storedDevice) as LastAddedDevice

          // Only use the stored device if it was added in the last 24 hours
          const addedTime = new Date(parsedDevice.timestamp).getTime()
          const currentTime = new Date().getTime()
          const hoursSinceAdded = (currentTime - addedTime) / (1000 * 60 * 60)

          if (hoursSinceAdded < 24) {
            setLastAddedDevice(parsedDevice)
          } else {
            // Clear old data
            localStorage.removeItem("lastAddedDevice")
          }
        }
      } catch (error) {
        console.error("Error getting user data:", error)
        setUserData(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddDeviceClick = () => {
    setShowAddDeviceFlow(true)
  }

  const handleCloseAddDeviceFlow = () => {
    setShowAddDeviceFlow(false)
    // Refresh user data after adding a device
    getUserData()
      .then((data) => {
        setUserData(data)

        // Check for updated last added device
        const storedDevice = localStorage.getItem("lastAddedDevice")
        if (storedDevice) {
          setLastAddedDevice(JSON.parse(storedDevice))
        } else {
          setLastAddedDevice(null)
        }
      })
      .catch((error) => {
        console.error("Error refreshing user data:", error)
      })
  }

  const getDeviceTypeDisplayName = (type: string) => {
    switch (type) {
      case "hub":
        return "Hub"
      case "relay_hub":
        return "Relay Hub"
      case "turn_signal":
        return "Turn Signal Kit"
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="container px-4 py-8">
        <h1 className="text-2xl font-bold">Not authenticated</h1>
        <p>Please log in to view this page.</p>
      </div>
    )
  }

  // Check both camelCase and snake_case property names to be safe
  const vehicleName = userData.vehicleName || userData.vehicle_name || "My Vehicle"
  const vehicleType = userData.vehicleType || userData.vehicle_type || "Vehicle"

  // Check if user has any hub or turn signal devices
  const hubDetails = userData.hubDetails || []
  const hasHubOrTurnSignal = hubDetails.some(
    (device: any) =>
      device.deviceType === "hub" || device.deviceType === "relay_hub" || device.deviceType === "turn_signal",
  )

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <DashboardHeaderWrapper
        vehicleName={vehicleName}
        vehicleType={vehicleType}
        showFavorites={userData.settings?.showFavorites ?? true}
      />

      <div className="container px-4 py-4 flex-1">
        {/* Add the AutoConnectHandler component */}
        <AutoConnectHandler />

        {!hasHubOrTurnSignal ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
            <h2 className="text-2xl font-bold">Welcome to a new way of managing your off-road accessories</h2>
            <p className="text-muted-foreground max-w-md">
              Get started by adding a hub or turn signal kit to your vehicle to unlock the full potential of your
              control center.
            </p>
            <Button size="lg" className="mt-4" onClick={handleAddDeviceClick}>
              Add hub or turn signal kit
            </Button>
          </div>
        ) : lastAddedDevice ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
            <h2 className="text-2xl font-bold">
              Congratulations! You added your {getDeviceTypeDisplayName(lastAddedDevice.type)}
            </h2>
            <p className="text-muted-foreground max-w-md">
              Now add your accessories to your account to configure them in the control center.
            </p>
            <Button size="lg" className="mt-4" onClick={handleAddDeviceClick}>
              Add accessories
            </Button>
          </div>
        ) : (
          <ControlCenterV2 userData={userData} setUserData={setUserData} />
        )}
      </div>

      <BottomNav />

      {/* Add Device Flow */}
      <AddDeviceFlow open={showAddDeviceFlow} onClose={handleCloseAddDeviceFlow} />
    </main>
  )
}
