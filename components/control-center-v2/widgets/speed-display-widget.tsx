"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface SpeedDisplayWidgetProps {
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
  isEditing?: boolean
}

export function SpeedDisplayWidget({
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  isEditing = false,
}: SpeedDisplayWidgetProps) {
  const [speed, setSpeed] = useState(0)
  const [unit, setUnit] = useState("MPH")

  // Simulate speed changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate a random speed between 0 and 85
      const newSpeed = Math.floor(Math.random() * 85)
      setSpeed(newSpeed)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Get the appropriate color based on speed
  const getSpeedColor = () => {
    if (speed < 30) return "text-green-500"
    if (speed < 60) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div
      className="p-3 flex flex-col items-center justify-center h-full"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <div className="text-xs font-medium text-muted-foreground mb-1">VEHICLE SPEED</div>
      <div className={`text-8xl font-bold ${getSpeedColor()}`}>{speed}</div>
      <div className="text-sm font-medium mt-1">{unit}</div>
    </div>
  )
}
