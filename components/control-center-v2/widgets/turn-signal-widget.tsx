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
    setActiveSignal((prev) => (prev === "left" ? null : "left"))
    onLeft()
  }, [onLeft])

  const handleRightClick = useCallback(() => {
    setActiveSignal((prev) => (prev === "right" ? null : "right"))
    onRight()
  }, [onRight])

  const handleHazardClick = useCallback(() => {
    setActiveSignal((prev) => (prev === "hazard" ? null : "hazard"))
    onHazard()
  }, [onHazard])

  return (
    <div className="p-4 bg-black rounded-xl border border-gray-800 w-full h-full flex flex-col">
      <div className="mb-4 text-lg font-medium text-white text-center">{title}</div>
      <div className="flex justify-between gap-3 flex-1">
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white hover:bg-gray-900 transition-colors duration-200",
            activeSignal === "left" && isFlashing && "bg-yellow-500",
          )}
          onClick={handleLeftClick}
          aria-label="Activate Left Turn Signal"
          aria-pressed={activeSignal === "left"}
        >
          <ArrowLeft className="h-8 w-8" />
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white hover:bg-gray-900 transition-colors duration-200",
            activeSignal === "hazard" && isFlashing && "bg-red-600",
          )}
          onClick={handleHazardClick}
          aria-label="Toggle Hazard Lights"
          aria-pressed={activeSignal === "hazard"}
        >
          <AlertTriangle className="h-8 w-8" />
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white hover:bg-gray-900 transition-colors duration-200",
            activeSignal === "right" && isFlashing && "bg-yellow-500",
          )}
          onClick={handleRightClick}
          aria-label="Activate Right Turn Signal"
          aria-pressed={activeSignal === "right"}
        >
          <ArrowRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  )
}
