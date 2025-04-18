"use client"

import { useState, useEffect } from "react"
import { useAccessories } from "@/contexts/device-context"

interface LightbarWidgetProps {
  id: string
  name: string
}

export function LightbarWidget({ id, name }: LightbarWidgetProps) {
  const [isOn, setIsOn] = useState(false)
  const { accessories, toggleAccessoryStatus } = useAccessories()

  // Find the lightbar accessory in the accessories list
  useEffect(() => {
    const lightbarAccessory = accessories.find(
      (acc) =>
        acc.accessoryName.toLowerCase().includes("lightbar") || acc.accessoryName.toLowerCase().includes("light bar"),
    )

    if (lightbarAccessory) {
      setIsOn(lightbarAccessory.accessoryConnectionStatus)
    }
  }, [accessories])

  const handleToggle = async () => {
    // Find the lightbar accessory
    const lightbarAccessory = accessories.find(
      (acc) =>
        acc.accessoryName.toLowerCase().includes("lightbar") || acc.accessoryName.toLowerCase().includes("light bar"),
    )

    if (lightbarAccessory) {
      const newState = !isOn
      setIsOn(newState) // Update local state immediately for better UX

      // Call the toggle function from context
      const success = await toggleAccessoryStatus(lightbarAccessory.accessoryID, newState)

      if (!success) {
        // Revert if the toggle failed
        setIsOn(!newState)
      }
    }
  }

  return (
    <div className="bg-black rounded-lg p-4 flex flex-col items-center justify-center h-full">
      <div className="text-center mb-2">{name}</div>
      <button
        onClick={handleToggle}
        className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center transition-all duration-300"
      >
        <div className={`text-4xl ${isOn ? "text-yellow-400" : "text-gray-600"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M12 6V2" />
            <path d="m4.93 10.93 1.41 1.41" />
            <path d="M2 18h2" />
            <path d="M20 18h2" />
            <path d="m19.07 10.93-1.41 1.41" />
            <path d="M12 18a6 6 0 0 0 0-12" />
            <path d="M12 18a6 6 0 0 0 0-12" />
          </svg>
        </div>
      </button>
      <div className="mt-2 text-xs text-gray-400">Relay</div>
    </div>
  )
}
