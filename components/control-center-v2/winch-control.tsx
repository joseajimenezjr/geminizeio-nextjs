"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown, Power } from "lucide-react"

export default function WinchControl() {
  const [powerOn, setPowerOn] = useState(false)

  const handlePowerClick = () => {
    setPowerOn(!powerOn)
    // You could add actual functionality here, like an API call
    console.log("Power state changed to:", !powerOn)
  }

  return (
    <div className="rounded-lg bg-black p-4 text-white">
      <div className="mb-2 text-lg font-medium">Winch</div>
      <div className="flex flex-col justify-between gap-2">
        <button className="flex h-20 w-full items-center justify-center rounded-lg border border-gray-700 bg-black hover:bg-gray-900">
          <ChevronUp className="h-6 w-6" />
        </button>
        <button
          className={`flex h-20 w-full items-center justify-center rounded-lg border border-gray-700 ${
            powerOn ? "bg-green-600 hover:bg-green-700" : "bg-black hover:bg-gray-900"
          }`}
          onClick={handlePowerClick}
        >
          <Power className="h-6 w-6" />
        </button>
        <button className="flex h-20 w-full items-center justify-center rounded-lg border border-gray-700 bg-black hover:bg-gray-900">
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
