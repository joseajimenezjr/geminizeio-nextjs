"use client"

import type React from "react"

import { Wifi, Cable } from "lucide-react"
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
}

export function AccessoryTypeSelector({ onSelect, isRelayHubAvailable }: AccessoryTypeSelectorProps) {
  // Define the accessory types based on whether a relay hub is available
  const accessoryTypes: AccessoryTypeOption[] = isRelayHubAvailable
    ? [
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
    : [
        {
          id: "wireless_accessory",
          title: "Wireless Accessory",
          description: "Add an accessory that connects wirelessly to your Hub",
          icon: Wifi,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        },
      ]

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
