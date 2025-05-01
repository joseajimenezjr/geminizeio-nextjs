"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TurnSignalSettings {
  countdownEnabled: boolean
  countdownDuration: number
}

interface TurnSignalWidgetProps {
  title: string
  accessoryId?: string
  onLeft: () => void
  onRight: () => void
  onHazard: () => void
  settings?: TurnSignalSettings
  onSettingsChange?: (settings: TurnSignalSettings) => void
}

export function TurnSignalWidget({
  title,
  accessoryId,
  onLeft,
  onRight,
  onHazard,
  settings = {
    countdownEnabled: true,
    countdownDuration: 30,
  },
  onSettingsChange,
}: TurnSignalWidgetProps) {
  const [activeSignal, setActiveSignal] = useState<"left" | "right" | "hazard" | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [progress, setProgress] = useState(100)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Function to start the countdown timer
  const startCountdown = () => {
    if (!settings.countdownEnabled) return

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set initial countdown value
    setCountdown(settings.countdownDuration)
    setProgress(100)

    // Start the interval
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time's up, clear the interval and reset the active signal
          clearInterval(intervalRef.current!)
          setActiveSignal(null)
          return 0
        }
        // Update progress percentage
        const newCount = prev - 1
        setProgress((newCount / settings.countdownDuration) * 100)
        return newCount
      })
    }, 1000)
  }

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Handle left signal button click
  const handleLeftClick = () => {
    if (activeSignal === "left") {
      // If already active, turn it off
      setActiveSignal(null)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } else {
      // Turn on left signal
      setActiveSignal("left")
      startCountdown()
    }
    onLeft()
  }

  // Handle right signal button click
  const handleRightClick = () => {
    if (activeSignal === "right") {
      // If already active, turn it off
      setActiveSignal(null)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } else {
      // Turn on right signal
      setActiveSignal("right")
      startCountdown()
    }
    onRight()
  }

  // Handle hazard button click
  const handleHazardClick = () => {
    if (activeSignal === "hazard") {
      // If already active, turn it off
      setActiveSignal(null)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } else {
      // Turn on hazard lights
      setActiveSignal("hazard")
      startCountdown()
    }
    onHazard()
  }

  return (
    <div className="p-4 pb-2 h-full flex flex-col" data-turn-signal-widget="true">
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="flex-1 flex items-stretch justify-between gap-2 h-full">
        <Button
          variant="outline"
          className={cn(
            "flex-1 relative h-full flex flex-col items-center justify-center overflow-hidden p-0",
            activeSignal === "left" && "bg-amber-500 text-white hover:bg-amber-600 hover:text-white",
          )}
          onClick={handleLeftClick}
          data-turn-signal="left"
        >
          {activeSignal === "left" && settings.countdownEnabled ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="absolute" width="100%" height="100%" viewBox="0 0 100 100">
                  <circle
                    className="text-amber-300"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r="48"
                    cx="50"
                    cy="50"
                    style={{
                      strokeDasharray: 301.59,
                      strokeDashoffset: 301.59 - (301.59 * progress) / 100,
                    }}
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center justify-center z-10">
                <svg
                  className="turn-signal-icon !w-20 !h-20"
                  style={{ width: "80px !important", height: "80px !important" }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                {countdown > 0 && <div className="text-sm mt-2">{countdown}s</div>}
              </div>
            </div>
          ) : (
            <svg
              className="turn-signal-icon !w-20 !h-20"
              style={{ width: "80px !important", height: "80px !important" }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          )}
        </Button>
        <Button
          variant="outline"
          className={cn(
            "flex-1 relative h-full flex flex-col items-center justify-center overflow-hidden p-0",
            activeSignal === "hazard" && "bg-red-500 text-white hover:bg-red-600 hover:text-white",
          )}
          onClick={handleHazardClick}
          data-turn-signal="hazard"
        >
          {activeSignal === "hazard" && settings.countdownEnabled ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="absolute" width="100%" height="100%" viewBox="0 0 100 100">
                  <circle
                    className="text-red-300"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r="48"
                    cx="50"
                    cy="50"
                    style={{
                      strokeDasharray: 301.59,
                      strokeDashoffset: 301.59 - (301.59 * progress) / 100,
                    }}
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center justify-center z-10">
                <svg
                  className="turn-signal-icon !w-20 !h-20"
                  style={{ width: "80px !important", height: "80px !important" }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
                {countdown > 0 && <div className="text-sm mt-2">{countdown}s</div>}
              </div>
            </div>
          ) : (
            <svg
              className="turn-signal-icon !w-20 !h-20"
              style={{ width: "80px !important", height: "80px !important" }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          )}
        </Button>
        <Button
          variant="outline"
          className={cn(
            "flex-1 relative h-full flex flex-col items-center justify-center overflow-hidden p-0",
            activeSignal === "right" && "bg-amber-500 text-white hover:bg-amber-600 hover:text-white",
          )}
          onClick={handleRightClick}
          data-turn-signal="right"
        >
          {activeSignal === "right" && settings.countdownEnabled ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="absolute" width="100%" height="100%" viewBox="0 0 100 100">
                  <circle
                    className="text-amber-300"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="transparent"
                    r="48"
                    cx="50"
                    cy="50"
                    style={{
                      strokeDasharray: 301.59,
                      strokeDashoffset: 301.59 - (301.59 * progress) / 100,
                    }}
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center justify-center z-10">
                <svg
                  className="turn-signal-icon !w-20 !h-20"
                  style={{ width: "80px !important", height: "80px !important" }}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 5 7 7-7 7" />
                  <path d="M5 12h14" />
                </svg>
                {countdown > 0 && <div className="text-sm mt-2">{countdown}s</div>}
              </div>
            </div>
          ) : (
            <svg
              className="turn-signal-icon !w-20 !h-20"
              style={{ width: "80px !important", height: "80px !important" }}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 5 7 7-7 7" />
              <path d="M5 12h14" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  )
}
