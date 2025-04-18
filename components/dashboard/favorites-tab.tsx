"use client"

import { useAccessories } from "@/contexts/device-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Wrench, Radio, Thermometer, Zap, ChevronRight, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardToggle } from "@/components/accessories/dashboard-toggle"

interface FavoritesTabProps {
  onDeviceClick?: (accessory: any) => void
}

export function FavoritesTab({ onDeviceClick }: FavoritesTabProps) {
  const { accessories } = useAccessories()

  // Filter favorites
  const favoriteAccessories = accessories.filter((accessory) => accessory.isFavorite)

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
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          FAVORITES
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {favoriteAccessories.length > 0 ? (
          <div className="divide-y divide-border/50">
            {favoriteAccessories.map((accessory) => {
              const AccessoryIcon = getAccessoryIcon(accessory.accessoryType)
              const isConnected = accessory.accessoryConnectionStatus

              return (
                <div
                  key={accessory.accessoryID}
                  className={cn(
                    "flex items-center justify-between p-4 transition-colors cursor-pointer",
                    isConnected ? "bg-primary/5" : "",
                  )}
                  onClick={() => onDeviceClick?.(accessory)}
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
                      <p className="font-medium leading-none">{accessory.accessoryName}</p>
                      <p className="text-xs text-muted-foreground">{formatRelayPosition(accessory.relayPosition)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DashboardToggle
                      accessoryID={accessory.accessoryID}
                      isOn={accessory.accessoryConnectionStatus || false}
                      relayPosition={accessory.relayPosition?.toString()}
                    />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No favorite accessories found</p>
            <p className="text-xs text-muted-foreground mt-1">Mark accessories as favorites to see them here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
