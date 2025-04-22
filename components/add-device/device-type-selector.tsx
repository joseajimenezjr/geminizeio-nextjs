"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DeviceTypeSelectorProps {
  onSelect: (deviceType: string) => void
  isLoading?: boolean
  errorMessage?: string | null
  limitToHubDevices?: boolean
}

export function DeviceTypeSelector({
  onSelect,
  isLoading = false,
  errorMessage = null,
  limitToHubDevices = false,
}: DeviceTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const handleSelect = (type: string) => {
    setSelectedType(type)
    onSelect(type)
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-1">Add a Device</h2>
        <p className="text-muted-foreground text-sm">
          {limitToHubDevices
            ? "Select a hub type to get started with your accessories"
            : "Choose the type of device you want to add"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : errorMessage ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md text-sm">{errorMessage}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {!limitToHubDevices && (
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center justify-center gap-2"
              onClick={() => handleSelect("accessory")}
            >
              <div className="text-lg font-medium">Accessory</div>
              <div className="text-xs text-muted-foreground">Lights, winches, and other accessories</div>
            </Button>
          )}

          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center justify-center gap-2"
            onClick={() => handleSelect("hub")}
          >
            <div className="text-lg font-medium">Hub</div>
            <div className="text-xs text-muted-foreground">Central control unit for wireless accessories</div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center justify-center gap-2"
            onClick={() => handleSelect("relay-hub")}
          >
            <div className="text-lg font-medium">Relay Hub</div>
            <div className="text-xs text-muted-foreground">Control unit for relay-based accessories</div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col items-center justify-center gap-2"
            onClick={() => handleSelect("turn-signal")}
          >
            <div className="text-lg font-medium">Turn Signal Kit</div>
            <div className="text-xs text-muted-foreground">Complete turn signal system for your vehicle</div>
          </Button>
        </div>
      )}
    </div>
  )
}
