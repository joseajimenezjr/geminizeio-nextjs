"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TurnSignalWidgetProps {
  title?: string
  accessoryId: string
  onLeft: () => void
  onRight: () => void
  onHazard: () => void
  settings?: TurnSignalSettings
  onSettingsChange?: (settings: TurnSignalSettings) => void
}

export interface TurnSignalSettings {
  countdownEnabled: boolean
  countdownDuration: number
}

type ActiveSignal = "left" | "right" | "hazard" | null

export function TurnSignalWidget({
  title = "Turn Signals",
  accessoryId,
  onLeft,
  onRight,
  onHazard,
  settings = { countdownEnabled: true, countdownDuration: 30 },
  onSettingsChange,
}: TurnSignalWidgetProps) {
  const [activeSignal, setActiveSignal] = useState<ActiveSignal>(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const [isHovered, setIsHovered] = useState<ActiveSignal>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [showCountdown, setShowCountdown] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const TOTAL_COUNTDOWN_TIME = settings.countdownDuration // Use the configured duration
  const SHOW_COUNTDOWN_AFTER = 0 // Show countdown immediately for demo purposes

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [])

  // Set up flashing effect when activeSignal changes
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // If there's an active signal, start the flashing interval
    if (activeSignal) {
      setIsFlashing(true)
      intervalRef.current = setInterval(() => {
        setIsFlashing((prev) => !prev)
      }, 1000) // Flash every second

      // Only start countdown if enabled in settings
      if (settings.countdownEnabled) {
        // Start countdown
        setCountdown(TOTAL_COUNTDOWN_TIME)

        // Show countdown after specified time
        setTimeout(() => {
          if (activeSignal) {
            setShowCountdown(true)
          }
        }, SHOW_COUNTDOWN_AFTER * 1000)
      }
    } else {
      setIsFlashing(false)
      setShowCountdown(false)
      setCountdown(null)

      // Clear countdown interval
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activeSignal, settings.countdownEnabled, TOTAL_COUNTDOWN_TIME])

  // Manage countdown timer
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      // Clear any existing countdown interval
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }

      // Set up new countdown interval
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1
          }
          return 0
        })
      }, 1000)
    } else if (countdown === 0) {
      // Auto-deactivate when countdown reaches zero
      setActiveSignal(null)
      setShowCountdown(false)

      // Clear countdown interval
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
        countdownRef.current = null
      }
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [countdown])

  const handleLeftClick = useCallback(() => {
    // If hazard is active, don't allow individual turn signals
    if (activeSignal === "hazard") return

    setActiveSignal((prev) => (prev === "left" ? null : "left"))
    // Clear any hover state
    setIsHovered(null)
    onLeft()
  }, [onLeft, activeSignal])

  const handleRightClick = useCallback(() => {
    // If hazard is active, don't allow individual turn signals
    if (activeSignal === "hazard") return

    setActiveSignal((prev) => (prev === "right" ? null : "right"))
    // Clear any hover state
    setIsHovered(null)
    onRight()
  }, [onRight, activeSignal])

  const handleHazardClick = useCallback(() => {
    setActiveSignal((prev) => (prev === "hazard" ? null : "hazard"))
    // Clear any hover state
    setIsHovered(null)
    onHazard()
  }, [onHazard])

  // Determine if left arrow should be lit
  const leftActive =
    activeSignal === "left" && isFlashing ? true : activeSignal === "hazard" && !isFlashing ? true : false

  // Determine if right arrow should be lit
  const rightActive =
    activeSignal === "right" && isFlashing ? true : activeSignal === "hazard" && !isFlashing ? true : false

  // Determine if hazard should be lit
  const hazardActive = activeSignal === "hazard" && isFlashing

  // Calculate progress for countdown circle
  const countdownProgress = countdown !== null ? (countdown / TOTAL_COUNTDOWN_TIME) * 100 : 0

  return (
    <div className="p-4 bg-card rounded-xl border border-gray-800 w-full h-full flex flex-col relative">
      <div className="mb-4 text-lg font-medium text-white text-center">{title}</div>
      <div className="flex justify-between gap-3 flex-1">
        <button
          className={cn(
            "flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-700 text-white transition-colors duration-200",
            leftActive ? "bg-yellow-500" : "bg-black",
          )}
          onClick={handleLeftClick}
          onMouseEnter={() => setIsHovered("left")}
          onMouseLeave={() => setIsHovered(null)}
          onTouchStart={() => {}}
          onTouchEnd={() => setIsHovered(null)}
          aria-label="Activate Left Turn Signal"
          aria-pressed={activeSignal === "left"}
        >
          <ArrowLeft className="h-8 w-8 mb-2" />
          {settings.countdownEnabled && showCountdown && activeSignal === "left" && (
            <CountdownIndicator progress={countdownProgress} seconds={countdown || 0} />
          )}
        </button>
        <button
          className={cn(
            "flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-700 text-white transition-colors duration-200",
            hazardActive ? "bg-red-600" : "bg-black",
          )}
          onClick={handleHazardClick}
          onMouseEnter={() => setIsHovered("hazard")}
          onMouseLeave={() => setIsHovered(null)}
          onTouchStart={() => {}}
          onTouchEnd={() => setIsHovered(null)}
          aria-label="Toggle Hazard Lights"
          aria-pressed={activeSignal === "hazard"}
        >
          <AlertTriangle className="h-8 w-8 mb-2" />
          {settings.countdownEnabled && showCountdown && activeSignal === "hazard" && (
            <CountdownIndicator progress={countdownProgress} seconds={countdown || 0} />
          )}
        </button>
        <button
          className={cn(
            "flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-700 text-white transition-colors duration-200",
            rightActive ? "bg-yellow-500" : "bg-black",
          )}
          onClick={handleRightClick}
          onMouseEnter={() => setIsHovered("right")}
          onMouseLeave={() => setIsHovered(null)}
          onTouchStart={() => {}}
          onTouchEnd={() => setIsHovered(null)}
          aria-label="Activate Right Turn Signal"
          aria-pressed={activeSignal === "right"}
        >
          <ArrowRight className="h-8 w-8 mb-2" />
          {settings.countdownEnabled && showCountdown && activeSignal === "right" && (
            <CountdownIndicator progress={countdownProgress} seconds={countdown || 0} />
          )}
        </button>
      </div>
    </div>
  )
}

// Countdown indicator component
function CountdownIndicator({ progress, seconds }: { progress: number; seconds: number }) {
  const circumference = 2 * Math.PI * 12 // 12 is the radius of the circle (smaller than before)
  const strokeDashoffset = circumference * (1 - progress / 100)

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <svg width="30" height="30" viewBox="0 0 30 30" className="rotate-[-90deg]">
          <circle cx="15" cy="15" r="12" fill="transparent" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2.5" />
          <circle
            cx="15"
            cy="15"
            r="12"
            fill="transparent"
            stroke="white"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-xs">
          {seconds}
        </div>
      </div>
    </div>
  )
}
