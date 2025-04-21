"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { LightbulbIcon, PowerIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// Add a style tag for the pulse animation
const pulseAnimationStyle = `
  @keyframes pulse-animation {
    0% {
      box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.3);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(22, 163, 74, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
    }
  }
  
  .widget-pulse {
    animation: pulse-animation 1.5s ease-out;
  }

  @keyframes continuous-flash {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  .continuous-flash {
    animation: continuous-flash 1s infinite;
  }
`

// Update the ToggleWidgetProps interface to include a userData update callback
interface ToggleWidgetProps {
  title: string
  accessoryType: string
  relayPosition?: string | number
  isConnected: boolean
  isOn: boolean
  isEditing?: boolean
  onToggle: () => void
  onUpdateUserData?: (accessoryId: string, isOn: boolean) => void // Add this new prop
  accessoryId?: string // Add this to identify which accessory is being toggled
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
}

export function ToggleWidget({
  title,
  accessoryType,
  relayPosition,
  isConnected,
  isOn,
  isEditing = false,
  onToggle,
  onUpdateUserData,
  accessoryId,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: ToggleWidgetProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)
  const [localIsOn, setLocalIsOn] = useState(isOn)
  const toggleButtonRef = useRef<HTMLDivElement>(null)

  // Update local state when prop changes
  useEffect(() => {
    setLocalIsOn(isOn)
  }, [isOn])

  // Add the pulse animation style to the document
  useEffect(() => {
    const styleTag = document.createElement("style")
    styleTag.innerHTML = pulseAnimationStyle
    document.head.appendChild(styleTag)

    return () => {
      document.head.removeChild(styleTag)
    }
  }, [])

  // Update the handleToggle function to call the onUpdateUserData callback
  const handleToggle = (e: React.MouseEvent) => {
    // Only toggle if not in editing mode and the accessory is connected
    if (!isEditing && isConnected) {
      console.log(
        `ToggleWidget: Toggle clicked, current state: ${localIsOn ? "ON" : "OFF"}, toggling to ${!localIsOn ? "ON" : "OFF"}`,
      )

      // Update local state immediately for responsive UI
      setLocalIsOn(!localIsOn)

      // Trigger pulse animation if turning on
      if (!localIsOn) {
        setIsPulsing(true)

        // Apply pulse class to the parent widget container
        const widgetContainer = toggleButtonRef.current?.closest(".widget-container")
        if (widgetContainer) {
          widgetContainer.classList.add("widget-pulse")
          setTimeout(() => {
            widgetContainer.classList.remove("widget-pulse")
            setIsPulsing(false)
          }, 1500) // Match animation duration
        } else {
          setTimeout(() => setIsPulsing(false), 1500)
        }
      }

      // Call the actual toggle function
      onToggle()

      // Update local userData if callback and accessoryId are provided
      if (onUpdateUserData && accessoryId) {
        onUpdateUserData(accessoryId, !localIsOn)
      }
    }
  }

  // Format the relay position for display
  const formatRelayPosition = () => {
    if (relayPosition === undefined || relayPosition === null) return null

    // If it's already a number, just return "Relay X"
    if (typeof relayPosition === "number") {
      return `Relay ${relayPosition}`
    }

    // If it's a string, try to extract the number
    if (typeof relayPosition === "string") {
      // If it's already in the format "Relay X", return as is
      if (relayPosition.toLowerCase().startsWith("relay")) {
        return relayPosition
      }

      // Otherwise, try to extract a number
      const matches = relayPosition.match(/\d+/)
      if (matches) {
        return `Relay ${matches[0]}`
      }

      // If no number found but string is not empty, return the string
      if (relayPosition.trim()) {
        return `Relay ${relayPosition}`
      }
    }

    return null
  }

  const relayPositionDisplay = formatRelayPosition()

  return (
    <div
      className={cn(
        "widget-container relative flex flex-col items-center justify-center w-full h-full p-4 transition-colors rounded-lg",
        localIsOn ? "bg-green-200" : "bg-card",
        isEditing ? "cursor-move" : isConnected ? "cursor-pointer" : "cursor-not-allowed opacity-70",
      )}
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        onMouseLeave?.()
      }}
      onMouseDown={(e) => onMouseDown?.(e)}
      onMouseUp={onMouseUp}
      onTouchStart={(e) => {
        // Prevent default to avoid scrolling
        e.preventDefault()
        onTouchStart?.(e)
      }}
      onTouchEnd={() => {
        onTouchEnd?.()
      }}
      onTouchCancel={() => {
        onTouchCancel?.()
      }}
    >
      {/* Relay position indicator */}
      {relayPositionDisplay && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground px-1.5 py-0.5 rounded">
          {relayPositionDisplay}
        </div>
      )}

      {/* Title with larger text and no background */}
      <div className={cn("text-xl font-semibold mb-3 text-center", localIsOn ? "text-green-800" : "text-foreground")}>
        {title}
      </div>

      {/* Toggle button */}
      <div
        ref={toggleButtonRef}
        className={cn(
          "relative flex items-center justify-center w-20 h-20 rounded-full border-4 transition-all",
          localIsOn
            ? "bg-green-500 border-green-600 text-white continuous-flash"
            : "bg-muted/50 border-muted-foreground/20 text-muted-foreground",
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {accessoryType === "light" ? (
            <LightbulbIcon
              className={cn("h-10 w-10 transition-all", localIsOn ? "text-white" : "text-muted-foreground/50")}
            />
          ) : (
            <PowerIcon
              className={cn("h-10 w-10 transition-all", localIsOn ? "text-white" : "text-muted-foreground/50")}
            />
          )}
        </div>
      </div>
    </div>
  )
}
