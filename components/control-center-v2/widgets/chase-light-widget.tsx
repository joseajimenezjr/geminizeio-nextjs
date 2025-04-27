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
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-full p-4 transition-colors rounded-lg bg-card",
        isEditing ? "cursor-move" : isConnected ? "cursor-default" : "cursor-not-allowed opacity-70",
      )}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      {/* Relay position indicator */}
      {relayPositionDisplay && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground px-1.5 py-0.5 rounded">
          {relayPositionDisplay}
        </div>
      )}

      {/* Title with larger text and no background */}
      <div className="text-xl font-semibold mb-3 text-center">{title}</div>

      <div className="flex gap-3">
        {/* Toggle button */}
        <button
          className={cn(
            "w-24 h-24 rounded-full border-4 transition-all flex items-center justify-center",
            isOn
              ? "bg-green-500 border-green-700 text-white"
              : "bg-muted/50 border-muted-foreground/20 text-muted-foreground",
          )}
          onClick={onToggle}
          disabled={isEditing || !isConnected}
        >
          <LightbulbIcon className="h-10 w-10" />
        </button>

        {/* Shuffle button */}
        <button
          className={cn(
            "w-24 h-24 rounded-full border-4 transition-all flex items-center justify-center",
            shuffleActive
              ? "bg-yellow-400 border-yellow-500 text-white"
              : "bg-muted/50 border-muted-foreground/20 text-muted-foreground",
          )}
          onClick={handlePatternChange}
          disabled={isEditing || !isConnected}
        >
          <Shuffle className="h-10 w-10" />
        </button>
      </div>
    </div>
  )
}
