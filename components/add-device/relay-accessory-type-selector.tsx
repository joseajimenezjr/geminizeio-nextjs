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
      title: "Toggle Light",
      description: "Control toggle lighting, for example a light bar with just an on/off switch.",
      icon: Lightbulb,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      id: "winch",
      title: "winch",
      description: "Control your winch to pull or loosen the rope.",
      icon: Fan,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      id: "chaseLight",
      title: "Light with Trigger",
      description: "Control your toggle light which supports triggering different patterns.",
      icon: Lightbulb,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      id: "rgbLight",
      title: "RGB Light",
      description: "Control your RGB lights using a 433mhz transmitter.",
      icon: Lightbulb,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      id: "temp_reader",
      title: "Clutch Belt Thermometer",
      description: "Monitor the temperature of your clutch belt.",
      icon: Thermometer,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      id: "voltage_reader",
      title: "Voltage Reader",
      description: "Monitor the voltage of your battery.",
      icon: Battery,
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
