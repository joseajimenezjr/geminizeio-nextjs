"use client"

import type React from "react"

import { useState, useEffect } from "react"

interface RPMDisplayWidgetProps {
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
  isEditing?: boolean
}

export function RPMDisplayWidget({
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  isEditing = false,
}: RPMDisplayWidgetProps) {
  const [rpm, setRPM] = useState(0)

  // Simulate RPM changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate a random RPM between 800 and 6000
      const newRPM = Math.floor(Math.random() * 5200) + 800
      setRPM(newRPM)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  // Get the appropriate color based on RPM
  const getRPMColor = () => {
    if (rpm < 2500) return "text-green-500"
    if (rpm < 4500) return "text-amber-500"
    return "text-red-500"
  }

  // Format RPM for display
  const formatRPM = (rpm: number) => {
    if (rpm >= 1000) {
      return `${(rpm / 1000).toFixed(1)}k`
    }
    return rpm.toString()
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
      <div className="text-xs font-medium text-muted-foreground mb-1">ENGINE RPM</div>
      <div className={`text-8xl font-bold ${getRPMColor()}`}>{formatRPM(rpm)}</div>
      <div className="text-sm font-medium mt-1">RPM</div>
    </div>
  )
}

// Add the correctly cased export alias
export const RpmDisplayWidget = RPMDisplayWidget
