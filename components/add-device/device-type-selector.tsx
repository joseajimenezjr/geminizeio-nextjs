"use client"

import type React from "react"

import { Network, Cpu, Lightbulb, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeviceTypeOption {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
}

// Update the props interface to include showAccessoryOption
interface DeviceTypeSelectorProps {
  onSelect: (deviceType: string) => void
  isLoading?: boolean
  errorMessage?: string | null
  showAccessoryOption?: boolean
}

// Update the component to conditionally show device types
export function DeviceTypeSelector({
  onSelect,
  isLoading = false,
  errorMessage = null,
  showAccessoryOption = true,
}: DeviceTypeSelectorProps) {
  // Define all possible device types
  const allDeviceTypes: DeviceTypeOption[] = [
    {
      id: "hub",
      title: "Hub",
      description: "Add a new central hub to control your accessories",
      icon: Network,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "relay-hub",
      title: "Relay Hub",
      description: "Add a relay hub to expand your control capabilities",
      icon: Cpu,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      id: "turn-signal",
      title: "Turn Signal Kit",
      description: "Add a turn signal kit for your vehicle",
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      id: "accessory",
      title: "Hub Accessory",
      description: "Add a new accessory to connect to your hub",
      icon: Lightbulb,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  // Filter device types based on showAccessoryOption
  const deviceTypes = showAccessoryOption
    ? allDeviceTypes
    : allDeviceTypes.filter((device) => device.id !== "accessory")

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">What would you like to add?</h2>

      {errorMessage && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="space-y-3 mt-6">
        {deviceTypes.map((device) => (
          <button
            key={device.id}
            className={cn(
              "w-full flex items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors",
              isLoading && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => !isLoading && onSelect(device.id)}
            disabled={isLoading}
          >
            <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", device.bgColor)}>
              <device.icon className={cn("h-5 w-5", device.color)} />
            </div>
            <div className="ml-4 text-left">
              <h3 className="font-medium">{device.title}</h3>
              <p className="text-sm text-muted-foreground">{device.description}</p>
            </div>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  )
}
