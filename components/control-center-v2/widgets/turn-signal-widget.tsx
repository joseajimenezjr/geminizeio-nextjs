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
}

type ActiveSignal = "left" | "right" | "hazard" | null

export function TurnSignalWidget({
  title = "Turn Signals",
  accessoryId,
  onLeft,
  onRight,
  onHazard,
}: TurnSignalWidgetProps) {
  const [activeSignal, setActiveSignal] = useState<ActiveSignal>(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const [isHovered, setIsHovered] = useState<ActiveSignal>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [showCountdown, setShowCountdown] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const TOTAL_COUNTDOWN_TIME = 30 // 30 seconds
  const SHOW_COUNTDOWN_AFTER = 0 // Show countdown immediately for demo purposes (change to desired value)

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

      // Start countdown
      setCountdown(TOTAL_COUNTDOWN_TIME)

      // Show countdown after specified time
      setTimeout(() => {
        if (activeSignal) {
          setShowCountdown(true)
        }
      }, SHOW_COUNTDOWN_AFTER * 1000)
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
  }, [activeSignal])

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
    <div className="p-4 bg-black rounded-xl border border-gray-800 w-full h-full flex flex-col relative">
      <div className="mb-4 text-lg font-medium text-white text-center">{title}</div>
      <div className="flex justify-between gap-3 flex-1">
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white transition-colors duration-200 relative",
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
          <ArrowLeft className="h-8 w-8" />
          {showCountdown && activeSignal === "left" && (
            <CountdownIndicator progress={countdownProgress} seconds={countdown || 0} />
          )}
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white transition-colors duration-200 relative",
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
          <AlertTriangle className="h-8 w-8" />
          {showCountdown && activeSignal === "hazard" && (
            <CountdownIndicator progress={countdownProgress} seconds={countdown || 0} />
          )}
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center rounded-xl border border-gray-700 text-white transition-colors duration-200 relative",
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
          <ArrowRight className="h-8 w-8" />
          {showCountdown && activeSignal === "right" && (
            <CountdownIndicator progress={countdownProgress} seconds={countdown || 0} />
          )}
        </button>
      </div>
    </div>
  )
}

// Countdown indicator component
function CountdownIndicator({ progress, seconds }: { progress: number; seconds: number }) {
  const circumference = 2 * Math.PI * 18 // 18 is the radius of the circle
  const strokeDashoffset = circumference * (1 - progress / 100)

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="relative">
        <svg width="44" height="44" viewBox="0 0 44 44" className="rotate-[-90deg]">
          <circle cx="22" cy="22" r="18" fill="transparent" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="3" />
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="transparent"
            stroke="white"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm">
          {seconds}
        </div>
      </div>
    </div>
  )
}
