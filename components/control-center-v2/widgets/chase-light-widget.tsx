"use client"

import type React from "react"
import { useState } from "react"
import { Shuffle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAccessories } from "@/contexts/device-context"
import { LightbulbIcon } from "lucide-react"
import { useBluetoothContext } from "@/contexts/bluetooth-context"
import { useToast } from "@/hooks/use-toast"

interface ChaseLightWidgetProps {
  title: string
  accessoryId: string
  isConnected: boolean
  isOn: boolean
  relayPosition?: string | number
  isEditing?: boolean
  onToggle: () => void
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
}

export function ChaseLightWidget({
  title,
  accessoryId,
  isConnected,
  isOn,
  relayPosition,
  isEditing = false,
  onToggle,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: ChaseLightWidgetProps) {
  const [selectedPattern, setSelectedPattern] = useState("pattern1")
  const [shuffleActive, setShuffleActive] = useState(false)
  const { toggleAccessoryStatus, accessories } = useAccessories()
  const { isConnected: isBtConnected, sendCommand } = useBluetoothContext()
  const { toast } = useToast()

  // Find the accessory data from the context to get the relay position
  const accessoryData = accessories.find((acc) => acc.accessoryID === accessoryId)
  const accessoryRelayPosition = accessoryData?.relayPosition

  const handlePatternChange = async () => {
    // Only proceed if Bluetooth is connected
    if (!isBtConnected) {
      toast({
        title: "Bluetooth Error",
        description: "Not connected to a Bluetooth device",
        variant: "destructive",
      })
      return
    }

    try {
      // Send the raw value 2 to the Bluetooth device
      const success = await sendCommand(2)

      if (success) {
        console.log(`Sent shuffle command (value 2) to device ${accessoryId}`)

        // Update the pattern state
        setSelectedPattern((prev) => {
          const newPattern = `pattern${Math.floor(Math.random() * 3) + 1}`
          console.log(`Selected pattern ${newPattern} for device ${accessoryId}`)
          return newPattern
        })

        // Activate the yellow flash effect
        setShuffleActive(true)

        // Turn off after 1 second
        setTimeout(() => {
          setShuffleActive(false)
        }, 1000)
      } else {
        console.error("Failed to send shuffle command")
        toast({
          title: "Command Failed",
          description: "Failed to send shuffle command",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending shuffle command:", error)
      toast({
        title: "Error",
        description: "Error sending shuffle command",
        variant: "destructive",
      })
    }
  }

  // Format relay position for display using the same approach as ToggleWidget
  const formatRelayPosition = () => {
    // Use the relay position from context if available, otherwise use the prop
    const positionToFormat = accessoryRelayPosition || relayPosition

    if (positionToFormat === undefined || positionToFormat === null) return null

    // If it's already a number, just return "Relay X"
    if (typeof positionToFormat === "number") {
      return `Relay ${positionToFormat}`
    }

    // If it's a string, try to extract the number
    if (typeof positionToFormat === "string") {
      // If it's already in the format "Relay X", return as is
      if (positionToFormat.toLowerCase().startsWith("relay")) {
        return positionToFormat
      }

      // Otherwise, try to extract a number
      const matches = positionToFormat.match(/\d+/)
      if (matches) {
        return `Relay ${matches[0]}`
      }

      // If no number found but string is not empty, return the string
      if (positionToFormat.trim()) {
        return `Relay ${positionToFormat}`
      }
    }

    return null
  }

  const relayPositionDisplay = formatRelayPosition()

  return (
    <div className="flex flex-col h-full w-full bg-black rounded-xl text-white p-4 select-none">
      {/* Widget Header - Title in center, relay position on right */}
      <div className="relative mb-6">
        <div className="absolute top-0 right-0 text-gray-400 text-lg">{relayPositionDisplay}</div>
        <div className="text-2xl font-bold text-center mt-4">{title}</div>
      </div>

      {/* Widget Content - Buttons with consistent size */}
      <div className="flex-1 flex items-center justify-center gap-6">
        {/* Toggle button */}
        <button
          className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-900 border-2 border-gray-700"
          onClick={onToggle}
          disabled={isEditing || !isConnected}
        >
          <LightbulbIcon className={cn("h-12 w-12", isOn ? "text-white" : "text-gray-500")} />
        </button>

        {/* Shuffle button */}
        <button
          className="w-20 h-20 rounded-full flex items-center justify-center bg-gray-900 border-2 border-gray-700"
          onClick={handlePatternChange}
          disabled={isEditing || !isConnected}
        >
          <Shuffle className={cn("h-12 w-12", shuffleActive ? "text-yellow-400" : "text-gray-500")} />
        </button>
      </div>
    </div>
  )
}
