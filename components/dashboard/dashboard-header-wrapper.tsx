"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"

interface DashboardHeaderWrapperProps {
  vehicleName: string
  vehicleType: string
  showFavorites: boolean
}

export function DashboardHeaderWrapper({ vehicleName, vehicleType, showFavorites }: DashboardHeaderWrapperProps) {
  return (
    <div className="w-full px-4">
      <DashboardHeader vehicleName={vehicleName} vehicleType={vehicleType} showFavorites={showFavorites} />
    </div>
  )
}
