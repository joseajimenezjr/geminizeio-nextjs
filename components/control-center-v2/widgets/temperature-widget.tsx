"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Thermometer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TemperatureWidgetProps {
  title?: string
  isConnected?: boolean
  isOn?: boolean
  isEditing?: boolean
  onToggle?: () => void
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
}

export function TemperatureWidget({
  title = "Temperature",
  isConnected = true,
  isOn = true,
  isEditing = false,
  onToggle,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: TemperatureWidgetProps) {
  const [temperature, setTemperature] = useState(72)
  const [unit, setUnit] = useState<"F" | "C">("F")

  // Simulate temperature changes
  useEffect(() => {
    if (!isEditing && isConnected && isOn) {
      const interval = setInterval(() => {
        // Random fluctuation between -1 and +1 degrees
        const fluctuation = Math.random() * 2 - 1
        setTemperature((prev) => Math.round((prev + fluctuation) * 10) / 10)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [isEditing, isConnected, isOn])

  // Toggle between Fahrenheit and Celsius
  const toggleUnit = () => {
    if (unit === "F") {
      // Convert to Celsius
      setTemperature(Math.round((((temperature - 32) * 5) / 9) * 10) / 10)
      setUnit("C")
    } else {
      // Convert to Fahrenheit
      setTemperature(Math.round((temperature * 9) / 5 + 32 * 10) / 10)
      setUnit("F")
    }
  }

  // Determine temperature color based on value
  const getTemperatureColor = () => {
    if (unit === "F") {
      if (temperature < 32) return "text-blue-500"
      if (temperature < 50) return "text-blue-300"
      if (temperature < 70) return "text-green-400"
      if (temperature < 85) return "text-yellow-400"
      if (temperature < 95) return "text-orange-400"
      return "text-red-500"
    } else {
      // Celsius
      if (temperature < 0) return "text-blue-500"
      if (temperature < 10) return "text-blue-300"
      if (temperature < 21) return "text-green-400"
      if (temperature < 29) return "text-yellow-400"
      if (temperature < 35) return "text-orange-400"
      return "text-red-500"
    }
  }

  return (
    <Card
      className="h-full w-full border-none bg-transparent"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <CardHeader className="p-3 pb-0">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>{title}</span>
          {!isConnected && <span className="text-xs text-muted-foreground">Disconnected</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-3">
        <div className="flex flex-col items-center">
          <Thermometer className={`h-8 w-8 mb-1 ${getTemperatureColor()}`} onClick={toggleUnit} />
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${getTemperatureColor()}`}>{temperature}</span>
            <span className={`ml-1 text-lg ${getTemperatureColor()}`}>°{unit}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {isConnected ? "Updated just now" : "Tap to reconnect"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
