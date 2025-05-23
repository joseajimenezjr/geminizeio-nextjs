"use client"

import type React from "react"

import { Wifi, Cable, MoveRightIcon as TurnRight, LampWallDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccessoryTypeOption {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
}

interface AccessoryTypeSelectorProps {
  onSelect: (accessoryType: string) => void
  isRelayHubAvailable: boolean
  isTurnSignalKitAvailable?: boolean
}

export function AccessoryTypeSelector({
  onSelect,
  isRelayHubAvailable,
  isTurnSignalKitAvailable = false,
}: AccessoryTypeSelectorProps) {
  // Define the accessory types based on what devices the user has
  let accessoryTypes: AccessoryTypeOption[] = []

  if (isTurnSignalKitAvailable) {
    // If user has a turn signal kit, show turn signal and reverse light options
    accessoryTypes = [
      {
        id: "turnSignal",
        title: "Turn Signal with Hazard Light Support",
        description: "Add a turn signal with hazard functionality to your vehicle",
        icon: TurnRight,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
      },
      {
        id: "reverse_light",
        title: "Reverse Light",
        description: "Add a reverse light to your vehicle",
        icon: LampWallDown,
        color: "text-white",
        bgColor: "bg-gray-500/10",
      },
    ]
  } else if (isRelayHubAvailable) {
    // If user has a relay hub, show relay and wireless accessory options
    accessoryTypes = [
      {
        id: "relay_accessory",
        title: "Relay Accessory",
        description: "Add an accessory that connects through your Relay Hub",
        icon: Cable,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
      },
      {
        id: "wireless_accessory",
        title: "Wireless Accessory",
        description: "Add an accessory that connects wirelessly to your Hub",
        icon: Wifi,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      },
    ]
  } else {
    // If user only has a regular hub, just show wireless accessory option
    accessoryTypes = [
      {
        id: "wireless_accessory",
        title: "Wireless Accessory",
        description: "Add an accessory that connects wirelessly to your Hub",
        icon: Wifi,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      },
    ]
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">What type of accessory?</h2>
      <div className="space-y-3 mt-6">
        {accessoryTypes.map((accessory) => (
          <button
            key={accessory.id}
            className="w-full flex items-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => onSelect(accessory.id)}
          >
            <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", accessory.bgColor)}>
              <accessory.icon className={cn("h-5 w-5", accessory.color)} />
            </div>
            <div className="ml-4 text-left">
              <h3 className="font-medium">{accessory.title}</h3>
              <p className="text-sm text-muted-foreground">{accessory.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
