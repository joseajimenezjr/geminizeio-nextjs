"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"

interface DashboardHeaderWrapperProps {
  vehicleName: string
  vehicleType: string
  showFavorites: boolean
}

export function DashboardHeaderWrapper({ vehicleName, vehicleType, showFavorites }: DashboardHeaderWrapperProps) {
  return <DashboardHeader vehicleName={vehicleName} vehicleType={vehicleType} showFavorites={showFavorites} />
}
