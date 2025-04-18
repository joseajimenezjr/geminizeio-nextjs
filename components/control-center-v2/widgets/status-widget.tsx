"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface StatusWidgetProps {
  title: string
  status: string
  statusColor: "green" | "yellow" | "red" | string
  isEditing?: boolean
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
}

export function StatusWidget({
  title,
  status,
  statusColor,
  isEditing = false,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: StatusWidgetProps) {
  // Map status color to Tailwind classes
  const getStatusColorClass = () => {
    switch (statusColor) {
      case "green":
        return "bg-green-500"
      case "yellow":
        return "bg-yellow-500"
      case "red":
        return "bg-red-500"
      default:
        return `bg-${statusColor}-500`
    }
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

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColorClass()}`} />
        <span className="text-sm font-medium">{status}</span>
      </div>
    </div>
  )
}
