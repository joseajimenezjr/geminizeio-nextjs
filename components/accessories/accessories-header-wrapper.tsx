"use client"

import { useState } from "react"
import { AccessoriesHeader } from "./accessories-header"

interface AccessoriesHeaderWrapperProps {
  vehicleName: string
  vehicleType: string
}

export function AccessoriesHeaderWrapper({ vehicleName, vehicleType }: AccessoriesHeaderWrapperProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate refresh
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Emit a custom event that the parent component can listen for
      if (typeof window !== "undefined") {
        const event = new CustomEvent("accessoriesrefresh")
        window.dispatchEvent(event)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <AccessoriesHeader
      vehicleName={vehicleName}
      vehicleType={vehicleType}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  )
}
