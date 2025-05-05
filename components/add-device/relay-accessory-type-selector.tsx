"use client"

import type React from "react"

import { Lightbulb, Fan, Plug, Thermometer } from "lucide-react"
import { cn } from "@/lib/utils"

interface RelayAccessoryTypeOption {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
}

interface RelayAccessoryTypeSelectorProps {
  onSelect: (accessoryType: string) => void
}

export function RelayAccessoryTypeSelector({ onSelect }: RelayAccessoryTypeSelectorProps) {
  const accessoryTypes: RelayAccessoryTypeOption[] = [
    {
      id: "light",
      title: "Light",
      description: "Control lighting through your Relay Hub",
      icon: Lightbulb,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      id: "fan",
      title: "Fan",
      description: "Control fans through your Relay Hub",
      icon: Fan,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      id: "outlet",
      title: "Smart Outlet",
      description: "Control power outlets through your Relay Hub",
      icon: Plug,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      id: "thermostat",
      title: "Thermostat",
      description: "Control temperature through your Relay Hub",
      icon: Thermometer,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">What kind of relay accessory?</h2>
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
