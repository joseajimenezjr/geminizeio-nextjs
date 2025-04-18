"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Power } from "lucide-react"

interface ControlButtonsProps {
  title: string
}

export default function ControlButtons({ title }: ControlButtonsProps) {
  const [powerOn, setPowerOn] = useState(false)

  const handlePowerClick = () => {
    setPowerOn(!powerOn)
  }

  return (
    <div className="rounded-lg bg-black p-4 text-white">
      <div className="mb-2 text-lg font-medium">{title}</div>
      <div className="flex justify-between gap-2">
        <button className="flex h-20 w-full items-center justify-center rounded-lg border border-gray-700 bg-black hover:bg-gray-900">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          className={`flex h-20 w-full items-center justify-center rounded-lg border border-gray-700 ${
            powerOn ? "bg-green-600" : "bg-black"
          } hover:bg-gray-900`}
          onClick={handlePowerClick}
        >
          <Power className="h-6 w-6" />
        </button>
        <button className="flex h-20 w-full items-center justify-center rounded-lg border border-gray-700 bg-black hover:bg-gray-900">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
