"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronUp, ChevronDown, Power } from "lucide-react"

interface UtilityWidgetProps {
  title: string
  isConnected: boolean
  isOn: boolean
  isEditing?: boolean
  onToggle: () => void
  onUpPress?: () => void
  onDownPress?: () => void
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
}

export function UtilityWidget({
  title,
  isConnected,
  isOn,
  isEditing = false,
  onToggle,
  onUpPress,
  onDownPress,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: UtilityWidgetProps) {
  const [upPressed, setUpPressed] = useState(false)
  const [downPressed, setDownPressed] = useState(false)
  const upTimerRef = useRef<NodeJS.Timeout | null>(null)
  const downTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle up button press
  const handleUpMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isEditing) return

    setUpPressed(true)
    if (upTimerRef.current) clearInterval(upTimerRef.current)

    // Call once immediately
    if (onUpPress) onUpPress()

    // Then set up interval for continuous press
    upTimerRef.current = setInterval(() => {
      if (onUpPress) onUpPress()
    }, 200)
  }

  // Handle down button press
  const handleDownMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isEditing) return

    setDownPressed(true)
    if (downTimerRef.current) clearInterval(downTimerRef.current)

    // Call once immediately
    if (onDownPress) onDownPress()

    // Then set up interval for continuous press
    downTimerRef.current = setInterval(() => {
      if (onDownPress) onDownPress()
    }, 200)
  }

  // Handle button release
  const handleButtonUp = (button: "up" | "down") => {
    if (button === "up") {
      setUpPressed(false)
      if (upTimerRef.current) {
        clearInterval(upTimerRef.current)
        upTimerRef.current = null
      }
    } else {
      setDownPressed(false)
      if (downTimerRef.current) {
        clearInterval(downTimerRef.current)
        downTimerRef.current = null
      }
    }
  }

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (upTimerRef.current) clearInterval(upTimerRef.current)
      if (downTimerRef.current) clearInterval(downTimerRef.current)
    }
  }, [])

  return (
    <div
      className={`flex flex-col h-full w-full p-3 ${isEditing ? "cursor-move" : ""}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={() => {
        handleButtonUp("up")
        handleButtonUp("down")
        if (onMouseLeave) onMouseLeave()
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <div className="text-sm font-medium mb-2 truncate">{title}</div>

      <div className="flex-1 flex flex-col gap-2">
        {/* Up button */}
        <button
          className={`flex-1 h-full flex items-center justify-center rounded-lg border ${
            upPressed ? "bg-primary text-primary-foreground" : "bg-muted/30 hover:bg-muted/50"
          }`}
          onMouseDown={handleUpMouseDown}
          onMouseUp={() => handleButtonUp("up")}
          onMouseLeave={() => handleButtonUp("up")}
          onTouchStart={handleUpMouseDown as any}
          onTouchEnd={() => handleButtonUp("up")}
          disabled={isEditing || !isConnected}
        >
          <ChevronUp className="h-6 w-6" />
        </button>

        {/* Power button */}
        <button
          className={`flex-1 h-full flex items-center justify-center rounded-lg border ${
            isOn ? "bg-green-500 text-white" : "bg-muted/30 hover:bg-muted/50"
          }`}
          onClick={isEditing ? undefined : onToggle}
          disabled={isEditing || !isConnected}
        >
          <Power className="h-6 w-6" />
        </button>

        {/* Down button */}
        <button
          className={`flex-1 h-full flex items-center justify-center rounded-lg border ${
            downPressed ? "bg-primary text-primary-foreground" : "bg-muted/30 hover:bg-muted/50"
          }`}
          onMouseDown={handleDownMouseDown}
          onMouseUp={() => handleButtonUp("down")}
          onMouseLeave={() => handleButtonUp("down")}
          onTouchStart={handleDownMouseDown as any}
          onTouchEnd={() => handleButtonUp("down")}
          disabled={isEditing || !isConnected}
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
