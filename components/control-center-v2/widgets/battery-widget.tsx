"use client"

import type React from "react"

import { BatteryCharging, BatteryFull, BatteryLow, BatteryMedium, BatteryWarning } from "lucide-react"
import { useState, useEffect } from "react"

interface BatteryWidgetProps {
  title?: string
  initialLevel?: number
  isEditing?: boolean
  accessoryId?: string
  isConnected?: boolean
  isOn?: boolean
  relayPosition?: number
  onToggle?: () => void
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
}

export function BatteryWidget({
  title = "Battery",
  initialLevel = 75,
  isEditing = false,
  accessoryId,
  isConnected = true,
  isOn = false,
  relayPosition,
  onToggle,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: BatteryWidgetProps) {
  const [batteryLevel, setBatteryLevel] = useState(initialLevel)
  const [isCharging, setIsCharging] = useState(false)

  // Simulate battery level changes for demo purposes
  useEffect(() => {
    if (!isEditing) {
      const interval = setInterval(() => {
        // Randomly fluctuate battery level slightly
        setBatteryLevel((prev) => {
          const change = Math.random() > 0.5 ? 1 : -1
          const newLevel = Math.max(0, Math.min(100, prev + change))
          return newLevel
        })

        // Randomly toggle charging state (less frequently)
        if (Math.random() > 0.95) {
          setIsCharging((prev) => !prev)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [isEditing])

  // Determine which battery icon to show based on level
  const getBatteryIcon = () => {
    if (isCharging) return <BatteryCharging className="h-6 w-6 text-green-500" />
    if (batteryLevel >= 80) return <BatteryFull className="h-6 w-6 text-green-500" />
    if (batteryLevel >= 50) return <BatteryMedium className="h-6 w-6 text-amber-500" />
    if (batteryLevel >= 20) return <BatteryLow className="h-6 w-6 text-orange-500" />
    return <BatteryWarning className="h-6 w-6 text-red-500" />
  }

  // Determine color based on battery level
  const getColorClass = () => {
    if (batteryLevel >= 80) return "bg-green-500"
    if (batteryLevel >= 50) return "bg-amber-500"
    if (batteryLevel >= 20) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div
      className="h-full w-full p-4 flex flex-col justify-between"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-sm">{title}</h3>
        {getBatteryIcon()}
      </div>

      <div className="text-3xl font-bold mb-2">
        {batteryLevel}%{isCharging && <span className="text-green-500 ml-1">⚡</span>}
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${getColorClass()}`} style={{ width: `${batteryLevel}%` }}></div>
      </div>

      <div className="text-xs text-muted-foreground mt-2">
        {isCharging ? "Charging" : batteryLevel < 20 ? "Low Battery" : "Battery Level"}
      </div>
    </div>
  )
}
