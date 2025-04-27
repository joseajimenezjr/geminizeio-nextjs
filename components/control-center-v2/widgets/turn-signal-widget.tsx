"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TurnSignalWidgetProps {
  title?: string
  accessoryId: string
  onLeft: () => void
  onRight: () => void
  onHazard: () => void
}

export function TurnSignalWidget({
  title = "Turn Signals",
  accessoryId,
  onLeft,
  onRight,
  onHazard,
}: TurnSignalWidgetProps) {
  const [leftActive, setLeftActive] = useState(false)
  const [rightActive, setRightActive] = useState(false)
  const [hazardActive, setHazardActive] = useState(false)

  const handleLeftClick = useCallback(() => {
    setLeftActive(true)
    setTimeout(() => setLeftActive(false), 500) // Simulate blink for 500ms
    onLeft()
  }, [onLeft])

  const handleRightClick = useCallback(() => {
    setRightActive(true)
    setTimeout(() => setRightActive(false), 500) // Simulate blink for 500ms
    onRight()
  }, [onRight])

  const handleHazardClick = useCallback(() => {
    setHazardActive((prev) => !prev)
    // Simulate toggling hazard lights
    setTimeout(() => setHazardActive((prev) => !prev), 500)
    onHazard()
  }, [onHazard])

  return (
    <div className="p-4 bg-black rounded-xl border border-gray-800 w-full h-full flex flex-col">
      <div className="mb-4 text-lg font-medium text-white text-center">{title}</div>
      <div className="flex justify-between gap-3 flex-1">
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white hover:bg-gray-900 transition-colors duration-200",
            leftActive && "bg-green-600",
          )}
          onClick={handleLeftClick}
          aria-label="Activate Left Turn Signal"
        >
          <ArrowLeft className="h-8 w-8" />
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white hover:bg-gray-900 transition-colors duration-200",
            hazardActive && "bg-red-600",
          )}
          onClick={handleHazardClick}
          aria-label="Toggle Hazard Lights"
        >
          <AlertTriangle className="h-8 w-8" />
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white hover:bg-gray-900 transition-colors duration-200",
            rightActive && "bg-green-600",
          )}
          onClick={handleRightClick}
          aria-label="Activate Right Turn Signal"
        >
          <ArrowRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  )
}
