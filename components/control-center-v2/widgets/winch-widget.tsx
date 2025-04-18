"use client"

import { useState } from "react"
import { Anchor } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WinchWidget() {
  const [isActive, setIsActive] = useState(false)
  const [tension, setTension] = useState(0)
  const [length, setLength] = useState(0)

  const toggleWinch = () => {
    setIsActive(!isActive)

    // If turning on, start increasing tension and length
    if (!isActive) {
      const interval = setInterval(() => {
        setTension((prev) => {
          const newTension = prev + 5
          if (newTension >= 100) {
            clearInterval(interval)
            return 100
          }
          return newTension
        })

        setLength((prev) => prev + 0.5)
      }, 500)

      // Store interval ID to clear it later
      // @ts-ignore
      window.winchInterval = interval
    } else {
      // If turning off, clear interval and reset values
      // @ts-ignore
      clearInterval(window.winchInterval)
      setTension(0)
      setLength(0)
    }
  }

  return (
    <div className="p-3 flex flex-col h-full">
      <div className="text-sm font-medium text-muted-foreground mb-2 w-full text-center">Winch Control</div>

      <div className="flex items-center justify-center mb-3">
        <Anchor className={`h-6 w-6 mr-2 ${isActive ? "text-green-500" : "text-muted-foreground"}`} />
        <div className="text-lg font-semibold">{isActive ? "ACTIVE" : "INACTIVE"}</div>
      </div>

      <div className="space-y-2 flex-grow">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Tension</span>
            <span>{tension}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${tension}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Length</span>
            <span>{length.toFixed(1)} m</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(length * 5, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <Button variant={isActive ? "destructive" : "default"} className="mt-3 w-full" onClick={toggleWinch}>
        {isActive ? "STOP WINCH" : "START WINCH"}
      </Button>
    </div>
  )
}
