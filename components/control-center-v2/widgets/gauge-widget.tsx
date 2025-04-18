"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface GaugeWidgetProps {
  title: string
  value: number
  min: number
  max: number
  unit: string
  isEditing?: boolean
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
}

export function GaugeWidget({
  title,
  value,
  min,
  max,
  unit,
  isEditing = false,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: GaugeWidgetProps) {
  // Calculate percentage for the gauge
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  // Determine color based on value
  const getColor = () => {
    if (percentage < 30) return "text-red-500"
    if (percentage < 70) return "text-yellow-500"
    return "text-green-500"
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-full p-4 transition-colors",
        isEditing ? "cursor-move" : "cursor-default",
      )}
      onMouseDown={(e) => onMouseDown?.(e)}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={(e) => {
        // Prevent default to avoid scrolling
        e.preventDefault()
        onTouchStart?.(e)
      }}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      {/* Title */}
      <div className="text-sm font-medium mb-2 text-center">{title}</div>

      {/* Gauge */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted-foreground/20"
          />
          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={`${percentage * 2.83} 283`}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className={getColor()}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold">{value}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
    </div>
  )
}
