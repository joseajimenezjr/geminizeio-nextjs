"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { ControlCenterV2 } from "@/components/control-center-v2/control-center"
import { DashboardHeaderWrapper } from "@/components/dashboard/dashboard-header-wrapper"
import { BottomNav } from "@/components/layout/bottom-nav"
import { AutoConnectHandler } from "@/components/dashboard/auto-connect-handler"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AddDeviceFlow } from "@/components/add-device/add-device-flow"
import { useAuthStore } from "@/contexts/auth-store"

export default function ControlCenterV2Page() {
  const { userData, hasHubDevices, updateUserData } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDeviceFlow, setShowAddDeviceFlow] = useState(false)
  const [limitDeviceOptions, setLimitDeviceOptions] = useState(false)

  useEffect(() => {
    if (userData) {
      setIsLoading(false)
    }
  }, [userData])

  const getAddDeviceButtonText = () => {
    return hasHubDevices ? "Add Accessory" : "Add Hub or Turn Signal Kit"
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
  const accessories = userData?.accessories || []
  const accessoryLimit = userData?.accessoryLimit || 4
  const showFavorites = userData?.settings?.showFavorites ?? true

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <DashboardHeaderWrapper vehicleName={vehicleName} vehicleType={vehicleType} showFavorites={showFavorites} />

      <div className="container px-4 py-4 flex-1">
        {/* Add the AutoConnectHandler component */}
        <AutoConnectHandler />
        <ControlCenterV2 userData={userData} vehicleName={vehicleName} vehicleType={vehicleType} />
        <Button
          onClick={() => {
            setLimitDeviceOptions(false)
            setShowAddDeviceFlow(true)
          }}
          className="mt-4"
        >
          {getAddDeviceButtonText()}
        </Button>
      </div>

      <AddDeviceFlow
        open={showAddDeviceFlow}
        onClose={() => setShowAddDeviceFlow(false)}
        limitToHubDevices={limitDeviceOptions}
        setUserData={updateUserData}
      />

      <BottomNav />
    </main>
  )
}
