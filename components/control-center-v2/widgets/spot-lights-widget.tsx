"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAccessories } from "@/contexts/device-context"
import { Lightbulb } from "lucide-react"

interface SpotLightsWidgetProps {
  id: string
  name: string
  isEditing?: boolean
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
}

export function SpotLightsWidget({
  id,
  name,
  isEditing,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: SpotLightsWidgetProps) {
  const [isOn, setIsOn] = useState(false)
  const { accessories, toggleAccessoryStatus } = useAccessories()

  // Find the spot lights accessory in the accessories list
  useEffect(() => {
    const spotLightsAccessory = accessories.find(
      (acc) => acc.accessoryName.toLowerCase().includes("spot") || acc.accessoryType.toLowerCase().includes("light"),
    )

    if (spotLightsAccessory) {
      setIsOn(spotLightsAccessory.accessoryConnectionStatus)
    }
  }, [accessories])

  const handleToggle = async () => {
    // Find the spot lights accessory
    const spotLightsAccessory = accessories.find(
      (acc) => acc.accessoryName.toLowerCase().includes("spot") || acc.accessoryType.toLowerCase().includes("light"),
    )

    if (spotLightsAccessory) {
      const newState = !isOn
      setIsOn(newState) // Update local state immediately for better UX

      // Call the toggle function from context
      toggleAccessoryStatus(spotLightsAccessory.accessoryID, newState)
    }
  }

  return (
    <div
      className="bg-black rounded-lg p-4 flex flex-col items-center justify-center h-full"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <div className="text-center mb-2 text-white">{name}</div>
      <button
        onClick={handleToggle}
        className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center transition-all duration-300"
      >
        <div className={`text-4xl ${isOn ? "text-yellow-400" : "text-gray-600"}`}>
          <Lightbulb />
        </div>
      </button>
      <div className="mt-2 text-xs text-gray-400">Relay</div>
    </div>
  )
}
