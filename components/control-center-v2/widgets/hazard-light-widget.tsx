"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"

interface HazardLightWidgetProps {
  title?: string
}

export function HazardLightWidget({ title = "Hazard Lights" }: HazardLightWidgetProps) {
  const [isOn, setIsOn] = useState(false)

  const handleToggle = () => {
    setIsOn(!isOn)
    console.log("Hazard lights toggled to:", !isOn)
  }

  return (
    <div className="p-4 bg-black rounded-lg border border-gray-700 w-full h-full flex flex-col items-center justify-center">
      <div className="text-sm font-medium text-white">{title}</div>
      <button
        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${
          isOn ? "bg-red-600 border-red-700 text-white" : "bg-gray-800 border-gray-700 text-gray-400"
        }`}
        onClick={handleToggle}
      >
        <AlertTriangle className="h-10 w-10" />
      </button>
    </div>
  )
}
