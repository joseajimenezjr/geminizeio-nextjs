"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Power } from "lucide-react"

interface TurnSignalWidgetProps {
  title?: string
}

export function TurnSignalWidget({ title = "Turn Signal" }: TurnSignalWidgetProps) {
  const [direction, setDirection] = useState<"left" | "right" | "off">("off")

  const handleLeftClick = () => {
    setDirection("left")
    setTimeout(() => setDirection("off"), 2000) // Simulate auto-off after 2 seconds
  }

  const handleRightClick = () => {
    setDirection("right")
    setTimeout(() => setDirection("off"), 2000) // Simulate auto-off after 2 seconds
  }

  return (
    <div className="p-4 bg-black rounded-lg border border-gray-700 w-full h-full flex flex-col">
      <div className="mb-2 text-sm font-medium text-white">{title}</div>
      <div className="flex justify-between gap-2 flex-grow">
        <button
          className={`flex h-16 w-full items-center justify-center rounded-lg border border-gray-700 bg-black hover:bg-gray-900 text-white ${
            direction === "left" ? "bg-yellow-600" : ""
          }`}
          onClick={handleLeftClick}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button className="flex h-16 w-full items-center justify-center rounded-lg border border-gray-700 bg-black hover:bg-gray-900 text-white">
          <Power className="h-6 w-6" />
        </button>
        <button
          className={`flex h-16 w-full items-center justify-center rounded-lg border border-gray-700 bg-black hover:bg-gray-900 text-white ${
            direction === "right" ? "bg-yellow-600" : ""
          }`}
          onClick={handleRightClick}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
