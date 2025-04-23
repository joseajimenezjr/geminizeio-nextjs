"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TurnSignalWidgetProps {
  title: string
  accessoryId: string
  onLeft: () => void
  onRight: () => void
}

export function TurnSignalWidget({ title, accessoryId, onLeft, onRight }: TurnSignalWidgetProps) {
  const [leftActive, setLeftActive] = useState(false)
  const [rightActive, setRightActive] = useState(false)

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

  return (
    <div className="p-4 bg-black rounded-lg border border-gray-700 w-full h-full flex flex-col items-center justify-center">
      <div className="mb-2 text-sm font-medium text-white">{title}</div>
      <div className="flex justify-between gap-2">
        <button
          className={cn(
            "flex h-16 w-24 items-center justify-center rounded-lg border border-gray-700 text-white hover:bg-gray-900",
            leftActive && "bg-green-600",
          )}
          onClick={handleLeftClick}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <button
          className={cn(
            "flex h-16 w-24 items-center justify-center rounded-lg border border-gray-700 text-white hover:bg-gray-900",
            rightActive && "bg-green-600",
          )}
          onClick={handleRightClick}
        >
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
