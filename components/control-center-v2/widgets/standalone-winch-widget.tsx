"use client"

import type React from "react"

import { useState } from "react"
import { ChevronUp, ChevronDown, Power } from "lucide-react"

interface StandaloneWinchWidgetProps {
  title?: string
}

export function StandaloneWinchWidget({ title = "Winch" }: StandaloneWinchWidgetProps) {
  const [powerOn, setPowerOn] = useState(false)

  const handlePowerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPowerOn((prevState) => !prevState)
    console.log("Winch power button clicked, new state:", !powerOn)
  }

  const handleUpClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Winch up button clicked")
  }

  const handleDownClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Winch down button clicked")
  }

  return (
    <div className="p-4 bg-black rounded-lg border border-gray-700 w-full h-full flex flex-col">
      <div className="mb-2 text-sm font-medium text-white">{title}</div>
      <div className="flex flex-col justify-between gap-2 flex-grow">
        <button
          className="flex h-16 w-full items-center justify-center rounded-lg border border-gray-700 bg-black hover:bg-gray-900 text-white"
          onClick={handleUpClick}
        >
          <ChevronUp className="h-6 w-6" />
        </button>
        <button
          className={`flex h-16 w-full items-center justify-center rounded-lg border border-gray-700 text-white ${
            powerOn ? "bg-green-600 hover:bg-green-700" : "bg-black hover:bg-gray-900"
          }`}
          onClick={handlePowerClick}
        >
          <Power className="h-6 w-6" />
        </button>
        <button
          className="flex h-16 w-full items-center justify-center rounded-lg border border-gray-700 bg-black hover:bg-gray-900 text-white"
          onClick={handleDownClick}
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
