"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TurnSignalWidgetProps {
  title?: string
  accessoryId: string
  onLeft: () => void
  onRight: () => void
  onHazard: () => void
}

type ActiveSignal = "left" | "right" | "hazard" | null

export function TurnSignalWidget({
  title = "Turn Signals",
  accessoryId,
  onLeft,
  onRight,
  onHazard,
}: TurnSignalWidgetProps) {
  const [activeSignal, setActiveSignal] = useState<ActiveSignal>(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const [isHovered, setIsHovered] = useState<ActiveSignal>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Set up flashing effect when activeSignal changes
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // If there's an active signal, start the flashing interval
    if (activeSignal) {
      setIsFlashing(true)
      intervalRef.current = setInterval(() => {
        setIsFlashing((prev) => !prev)
      }, 1000) // Flash every second
    } else {
      setIsFlashing(false)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activeSignal])

  const handleLeftClick = useCallback(() => {
    // If hazard is active, don't allow individual turn signals
    if (activeSignal === "hazard") return

    setActiveSignal((prev) => (prev === "left" ? null : "left"))
    // Clear any hover state
    setIsHovered(null)
    onLeft()
  }, [onLeft, activeSignal])

  const handleRightClick = useCallback(() => {
    // If hazard is active, don't allow individual turn signals
    if (activeSignal === "hazard") return

    setActiveSignal((prev) => (prev === "right" ? null : "right"))
    // Clear any hover state
    setIsHovered(null)
    onRight()
  }, [onRight, activeSignal])

  const handleHazardClick = useCallback(() => {
    setActiveSignal((prev) => (prev === "hazard" ? null : "hazard"))
    // Clear any hover state
    setIsHovered(null)
    onHazard()
  }, [onHazard])

  // Determine if left arrow should be lit
  const leftActive =
    activeSignal === "left" && isFlashing ? true : activeSignal === "hazard" && !isFlashing ? true : false

  // Determine if right arrow should be lit
  const rightActive =
    activeSignal === "right" && isFlashing ? true : activeSignal === "hazard" && !isFlashing ? true : false

  // Determine if hazard should be lit
  const hazardActive = activeSignal === "hazard" && isFlashing

  return (
    <div className="p-4 bg-black rounded-xl border border-gray-800 w-full h-full flex flex-col">
      <div className="mb-4 text-lg font-medium text-white text-center">{title}</div>
      <div className="flex justify-between gap-3 flex-1">
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white transition-colors duration-200",
            leftActive ? "bg-yellow-500" : "bg-black",
          )}
          onClick={handleLeftClick}
          onMouseEnter={() => setIsHovered("left")}
          onMouseLeave={() => setIsHovered(null)}
          onTouchStart={() => {}}
          onTouchEnd={() => setIsHovered(null)}
          aria-label="Activate Left Turn Signal"
          aria-pressed={activeSignal === "left"}
        >
          <ArrowLeft className="h-8 w-8" />
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white transition-colors duration-200",
            hazardActive ? "bg-red-600" : "bg-black",
          )}
          onClick={handleHazardClick}
          onMouseEnter={() => setIsHovered("hazard")}
          onMouseLeave={() => setIsHovered(null)}
          onTouchStart={() => {}}
          onTouchEnd={() => setIsHovered(null)}
          aria-label="Toggle Hazard Lights"
          aria-pressed={activeSignal === "hazard"}
        >
          <AlertTriangle className="h-8 w-8" />
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white transition-colors duration-200",
            rightActive ? "bg-yellow-500" : "bg-black",
          )}
          onClick={handleRightClick}
          onMouseEnter={() => setIsHovered("right")}
          onMouseLeave={() => setIsHovered(null)}
          onTouchStart={() => {}}
          onTouchEnd={() => setIsHovered(null)}
          aria-label="Activate Right Turn Signal"
          aria-pressed={activeSignal === "right"}
        >
          <ArrowRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  )
}
