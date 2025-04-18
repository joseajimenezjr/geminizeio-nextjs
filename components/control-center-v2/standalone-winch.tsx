"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Power } from "lucide-react"

export function StandaloneWinch() {
  const [powerOn, setPowerOn] = useState(false)

  const handlePowerClick = () => {
    setPowerOn(!powerOn)
    console.log("Power state changed to:", !powerOn)
  }

  return (
    <div className="p-4 bg-black rounded-lg border border-gray-700 max-w-md mx-auto">
      <div className="mb-2 text-lg font-medium text-white">Winch</div>
      <div className="flex justify-between gap-2">
        <button className="flex h-16 w-full items-center justify-center rounded-lg border border-gray-700 bg-black hover:bg-gray-900 text-white">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          className={`flex h-16 w-full items-center justify-center rounded-lg border border-gray-700 text-white ${
            powerOn ? "bg-green-600 hover:bg-green-700" : "bg-black hover:bg-gray-900"
          }`}
          onClick={handlePowerClick}
        >
          <Power className="h-6 w-6" />
        </button>
        <button className="flex h-16 w-full items-center justify-center rounded-lg border border-gray-700 bg-black hover:bg-gray-900 text-white">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
