"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface SpeedometerWidgetProps {
  className?: string
  initialSpeed?: number
  isEditing?: boolean
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
  title?: string
  value?: number
  maxValue?: number
  unit?: string
}

export function SpeedometerWidget({
  className,
  initialSpeed = 0,
  isEditing = false,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  title = "Vehicle Speed",
  maxValue = 120,
  unit = "MPH",
}: SpeedometerWidgetProps) {
  const [speed, setSpeed] = useState(initialSpeed)
  const [rpm, setRpm] = useState(0)
  const [isFlashing, setIsFlashing] = useState(false)
  const accelerationRef = useRef<number>(0)
  const lastUpdateRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)
  const targetSpeedRef = useRef<number>(65)
  const drivingPhaseRef = useRef<"accelerating" | "cruising" | "fluctuating">("accelerating")

  // Realistic race car speed simulation with fluctuations
  useEffect(() => {
    // Start with a moderate acceleration
    accelerationRef.current = 0.2

    const simulateRaceCarSpeed = (timestamp: number) => {
      if (!lastUpdateRef.current) {
        lastUpdateRef.current = timestamp
      }

      const deltaTime = timestamp - lastUpdateRef.current
      lastUpdateRef.current = timestamp

      // More realistic acceleration pattern with fluctuations
      setSpeed((prevSpeed) => {
        // Determine driving phase and behavior
        if (drivingPhaseRef.current === "accelerating") {
          // Initial acceleration phase
          if (prevSpeed < 20) {
            accelerationRef.current = 0.25
          } else if (prevSpeed < 40) {
            accelerationRef.current = 0.35
          } else if (prevSpeed < 60) {
            accelerationRef.current = 0.2
          } else if (prevSpeed < 75) {
            accelerationRef.current = 0.15
          } else {
            // Transition to fluctuating phase once we reach high speed
            if (prevSpeed >= 82) {
              drivingPhaseRef.current = "fluctuating"
              targetSpeedRef.current = 65 + Math.random() * 10
              accelerationRef.current = -0.15
            } else {
              accelerationRef.current = 0.1
            }
          }
        } else if (drivingPhaseRef.current === "fluctuating") {
          // In fluctuating phase, we aim for a target speed
          const diffToTarget = targetSpeedRef.current - prevSpeed

          // If we're close to target, set a new target
          if (Math.abs(diffToTarget) < 1) {
            // Set a new target speed
            if (targetSpeedRef.current < 75) {
              // If current target is low, aim higher
              targetSpeedRef.current = 78 + Math.random() * 10
              accelerationRef.current = 0.2
            } else {
              // If current target is high, aim lower
              targetSpeedRef.current = 65 + Math.random() * 8
              accelerationRef.current = -0.15
            }
          } else {
            // Adjust acceleration based on how far we are from target
            accelerationRef.current = diffToTarget * 0.02

            // Limit acceleration/deceleration rate
            accelerationRef.current = Math.max(-0.25, Math.min(0.25, accelerationRef.current))
          }
        }

        // Apply acceleration with time delta
        const speedChange = accelerationRef.current * (deltaTime / 16.67) // Normalized for 60fps

        // Calculate new speed with bounds
        const newSpeed = Math.max(0, Math.min(maxValue, prevSpeed + speedChange))

        // Update RPM based on speed (simplified simulation)
        const newRpm = Math.floor((newSpeed / maxValue) * 7000)
        setRpm(newRpm)

        return newSpeed
      })

      animationFrameRef.current = requestAnimationFrame(simulateRaceCarSpeed)
    }

    animationFrameRef.current = requestAnimationFrame(simulateRaceCarSpeed)

    // Handle flashing effect for certain speed ranges
    const flashInterval = setInterval(() => {
      if ((speed >= 56 && speed <= 65) || speed >= 76) {
        setIsFlashing((prev) => !prev)
      } else {
        setIsFlashing(false)
      }
    }, 800)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      clearInterval(flashInterval)
    }
  }, [maxValue])

  // Calculate font size with smooth transitions based on speed
  const calculateFontSize = () => {
    // Base size is 10rem
    const baseSize = 10

    if (speed <= 55) {
      return `${baseSize}rem`
    } else if (speed <= 65) {
      // Smooth transition from 10rem to 12rem between 55 and 65 mph
      const sizeIncrease = ((speed - 55) / 10) * 2
      return `${baseSize + sizeIncrease}rem`
    } else if (speed <= 75) {
      // Smooth transition from 12rem to 14rem between 65 and 75 mph
      const sizeIncrease = 2 + ((speed - 65) / 10) * 2
      return `${baseSize + sizeIncrease}rem`
    } else {
      // Smooth transition from 14rem to 16rem between 75 and 85 mph
      const sizeIncrease = 4 + Math.min(2, ((speed - 75) / 10) * 2)
      return `${baseSize + sizeIncrease}rem`
    }
  }

  // Calculate text color with smooth transitions based on speed
  const calculateTextColor = () => {
    if (speed <= 55) {
      return "text-emerald-800"
    } else if (speed <= 65) {
      return isFlashing ? "text-emerald-400" : "text-emerald-500"
    } else if (speed <= 75) {
      return "text-red-800"
    } else {
      return isFlashing ? "text-red-400" : "text-red-500"
    }
  }

  // Calculate opacity based on flashing state and speed
  const calculateOpacity = () => {
    if ((speed >= 56 && speed <= 65) || speed >= 76) {
      return isFlashing ? "opacity-100" : "opacity-80"
    }
    return "opacity-100"
  }

  return (
    <div
      className={cn(
        "relative w-full h-full bg-black rounded-lg p-2 flex flex-col items-center justify-center overflow-hidden",
        isEditing ? "cursor-move" : "",
        className,
      )}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <h2 className="text-white text-xl absolute top-2 left-0 right-0 text-center">{title}</h2>
      <div className="flex-1 flex items-center justify-center w-full h-full">
        <div
          className={cn(
            "font-mono font-bold transition-all duration-500 leading-none",
            calculateTextColor(),
            calculateOpacity(),
          )}
          style={{ fontSize: calculateFontSize() }}
        >
          {Math.round(speed).toString().padStart(2, "0")}
        </div>
      </div>
      <div className="text-gray-400 text-2xl absolute bottom-2 left-0 right-0 text-center">{unit}</div>
    </div>
  )
}
