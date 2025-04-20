"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { Thermometer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBluetoothContext } from "@/contexts/bluetooth-context"

interface TemperatureWidgetProps {
  title?: string
  isConnected?: boolean
  isOn?: boolean
  isEditing?: boolean
  onToggle?: () => void
  onMouseDown?: (e: React.MouseEvent | React.TouchEvent) => void
  onMouseUp?: () => void
  onMouseLeave?: () => void
  onTouchStart?: (e: React.TouchEvent) => void
  onTouchEnd?: () => void
  onTouchCancel?: () => void
}

export function TemperatureWidget({
  title = "Temperature",
  isConnected = true,
  isOn = true,
  isEditing = false,
  onToggle,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
}: TemperatureWidgetProps) {
  const [temperature, setTemperature] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [unit, setUnit] = useState<"F" | "C">("F")
  const { requestTemperatureUpdate, temperatureCharacteristic, isConnected: bluetoothConnected } = useBluetoothContext()
  const notificationsStartedRef = useRef(false)

  // Simulate temperature changes
  useEffect(() => {
    const setupTemperatureNotifications = async () => {
      if (temperatureCharacteristic && !notificationsStartedRef.current) {
        try {
          console.log("Starting temperature notifications...")
          await temperatureCharacteristic.startNotifications()
          notificationsStartedRef.current = true
          console.log("Temperature notifications started successfully")
        } catch (error) {
          console.error("Failed to start temperature notifications:", error)
        }
      }
    }

    if (bluetoothConnected && temperatureCharacteristic) {
      setupTemperatureNotifications()

      // Request initial temperature reading
      requestTemperatureUpdate()

      // Set up interval to request temperature updates periodically
      const intervalId = setInterval(() => {
        requestTemperatureUpdate()
      }, 10000) // Every 10 seconds

      return () => clearInterval(intervalId)
    }
  }, [bluetoothConnected, temperatureCharacteristic, requestTemperatureUpdate])

  useEffect(() => {
    const handleTemperatureUpdate = (event: Event) => {
      try {
        const target = event.target as BluetoothRemoteGATTCharacteristic
        if (!target.value) {
          console.warn("No value in temperature update event")
          return
        }

        const value = new TextDecoder().decode(target.value)
        console.log("Raw temperature data received:", target.value)
        console.log("Current temperature:", value)

        const tempValue = Number.parseFloat(value)
        if (!isNaN(tempValue)) {
          setTemperature(tempValue)
          setLastUpdated(new Date())
        } else {
          console.warn("Received invalid temperature value:", value)
        }
      } catch (error) {
        console.error("Error processing temperature update:", error)
      }
    }

    if (temperatureCharacteristic) {
      // Add event listener for temperature updates
      temperatureCharacteristic.addEventListener("characteristicvaluechanged", handleTemperatureUpdate)

      return () => {
        temperatureCharacteristic.removeEventListener("characteristicvaluechanged", handleTemperatureUpdate)
      }
    }
  }, [temperatureCharacteristic])

  // Toggle between Fahrenheit and Celsius
  const toggleUnit = useCallback(() => {
    if (!temperature) return

    if (unit === "F") {
      // Convert to Celsius
      setUnit("C")
    } else {
      // Convert to Fahrenheit
      setUnit("F")
    }
  }, [temperature, unit])

  // Add a function to display the temperature in the current unit
  const displayTemperature = useCallback(() => {
    if (temperature === null) return "--"

    if (unit === "F") {
      return temperature.toFixed(1)
    } else {
      // Convert F to C
      const celsius = ((temperature - 32) * 5) / 9
      return celsius.toFixed(1)
    }
  }, [temperature, unit])

  // Determine temperature color based on value
  const getTemperatureColor = useCallback(() => {
    if (temperature === null) return "text-muted-foreground"

    const tempValue = unit === "F" ? temperature : ((temperature - 32) * 5) / 9

    if (unit === "F") {
      if (tempValue < 32) return "text-blue-500"
      if (tempValue < 50) return "text-blue-300"
      if (tempValue < 70) return "text-green-400"
      if (tempValue < 85) return "text-yellow-400"
      if (tempValue < 95) return "text-orange-400"
      return "text-red-500"
    } else {
      // Celsius
      if (tempValue < 0) return "text-blue-500"
      if (tempValue < 10) return "text-blue-300"
      if (tempValue < 21) return "text-green-400"
      if (tempValue < 29) return "text-yellow-400"
      if (tempValue < 35) return "text-orange-400"
      return "text-red-500"
    }
  }, [temperature, unit])

  // Add a function to format the last updated time
  const formatLastUpdated = useCallback(() => {
    if (!lastUpdated) return "No data"

    const now = new Date()
    const diffMs = now.getTime() - lastUpdated.getTime()
    const diffSec = Math.floor(diffMs / 1000)

    if (diffSec < 60) {
      return "Just now"
    } else if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60)
      return `${mins} min${mins > 1 ? "s" : ""} ago`
    } else {
      const hours = Math.floor(diffSec / 3600)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    }
  }, [lastUpdated])

  return (
    <Card
      className="h-full w-full border-none bg-transparent"
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <CardHeader className="p-3 pb-0">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>{title}</span>
          {!bluetoothConnected && <span className="text-xs text-muted-foreground">Disconnected</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-3">
        <div className="flex flex-col items-center">
          <Thermometer className={`h-8 w-8 mb-1 ${getTemperatureColor()} cursor-pointer`} onClick={toggleUnit} />
          <div className="flex items-baseline">
            <span className={`text-3xl font-bold ${getTemperatureColor()}`}>{displayTemperature()}</span>
            <span className={`ml-1 text-lg ${getTemperatureColor()}`}>°{unit}</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {bluetoothConnected
              ? temperature === null
                ? "Waiting for data..."
                : formatLastUpdated()
              : "Tap to reconnect"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
