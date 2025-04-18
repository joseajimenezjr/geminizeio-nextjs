"use client"

import { Lightbulb, Wrench, Radio, Thermometer, Zap, ChevronRight, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardToggle } from "@/components/accessories/dashboard-toggle"
import { useAccessories } from "@/contexts/device-context"

interface AccessoriesListProps {
  onDeviceClick?: (accessory: any) => void
}

export function AccessoriesList({ onDeviceClick }: AccessoriesListProps) {
  const { accessories } = useAccessories()

  // Get the appropriate icon for each accessory type
  const getAccessoryIcon = (type: string) => {
    const accessoryType = type?.toLowerCase() || ""
    if (accessoryType.includes("light")) return Lightbulb
    if (accessoryType.includes("utility")) return Wrench
    if (accessoryType.includes("communication")) return Radio
    if (accessoryType.includes("sensor")) return Thermometer
    if (accessoryType.includes("power")) return Zap
    return Lightbulb // Default
  }

  // Format relay position for display
  const formatRelayPosition = (relayPosition: number | null | undefined): string => {
    if (!relayPosition) return "No location set"
    return `Relay ${relayPosition}`
  }

  return (
    <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-background to-muted/30">
      <CardHeader className="bg-background/50 backdrop-blur-sm border-b pb-3">
        <CardTitle className="text-sm font-medium">ACCESSORIES</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {accessories && accessories.length > 0 ? (
          <div className="divide-y divide-border/50">
            {accessories.map((accessory) => {
              const AccessoryIcon = getAccessoryIcon(accessory.accessoryType)
              const isConnected = accessory.accessoryConnectionStatus

              return (
                <div
                  key={accessory.accessoryID}
                  className={cn(
                    "flex items-center justify-between p-4 transition-colors",
                    isConnected ? "bg-primary/5" : "",
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        "rounded-md p-2 transition-colors",
                        isConnected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <AccessoryIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium leading-none">{accessory.accessoryName}</p>
                        {accessory.isFavorite && <Heart className="h-4 w-4 fill-red-500 text-red-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{formatRelayPosition(accessory.relayPosition)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DashboardToggle
                      accessoryID={accessory.accessoryID}
                      isOn={accessory.accessoryConnectionStatus || false}
                      relayPosition={accessory.relayPosition?.toString()}
                    />
                    <div
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeviceClick?.(accessory)
                      }}
                    >
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No accessories found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
