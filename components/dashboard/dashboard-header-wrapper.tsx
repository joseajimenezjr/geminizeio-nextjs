"use client"

import { useState } from "react"
import { DashboardHeader } from "./dashboard-header"

interface DashboardHeaderWrapperProps {
  vehicleName: string
  vehicleType: string
  showFavorites: boolean
}

export function DashboardHeaderWrapper({ vehicleName, vehicleType, showFavorites }: DashboardHeaderWrapperProps) {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Add event listener for tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Emit a custom event that the parent component can listen for
    if (typeof window !== "undefined") {
      const event = new CustomEvent("tabchange", { detail: { tab } })
      window.dispatchEvent(event)
    }
  }

  return (
    <DashboardHeader
      vehicleName={vehicleName}
      vehicleType={vehicleType}
      showFavorites={showFavorites}
      activeTab={activeTab}
      setActiveTab={handleTabChange}
    />
  )
}

