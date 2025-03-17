"use client"

import { Lightbulb, Wrench, Radio, Thermometer, Zap, Star, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { DashboardToggle } from "@/components/accessories/dashboard-toggle"
import { useAccessories } from "@/contexts/device-context"

interface FavoritesTabProps {
  onDeviceClick: (accessory: any) => void
}

export function FavoritesTab({ onDeviceClick }: FavoritesTabProps) {
  const { accessories } = useAccessories()

  // Filter to only show favorite accessories
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

  return (
    <div className="space-y-4">
      {favoriteAccessories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteAccessories.map((accessory) => {
            const AccessoryIcon = getAccessoryIcon(accessory.accessoryType)
            const isConnected = accessory.accessoryConnectionStatus

            return (
              <div
                key={accessory.accessoryID}
                onClick={() => onDeviceClick(accessory)}
                className={cn(
                  "relative rounded-lg border p-4 transition-colors cursor-pointer hover:bg-accent/50",
                  isConnected ? "bg-primary/5 border-primary/20" : "bg-card border-border",
                )}
              >
                <div className="absolute top-3 right-3">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>

                <div className="flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div
                      className={cn(
                        "rounded-md p-2 mr-3 transition-colors",
                        isConnected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <AccessoryIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-base">{accessory.accessoryName}</h3>
                      <p className="text-xs text-muted-foreground">{accessory.location || "No location"}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <Badge variant={isConnected ? "default" : "outline"} className="text-xs">
                      {isConnected ? "Connected" : "Not Connected"}
                    </Badge>

                    <DashboardToggle id={accessory.accessoryID} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Favorite Accessories</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Add accessories to your favorites for quick access. You can mark any accessory as a favorite in its details.
          </p>
          <Button asChild>
            <Link href="/accessories">
              <Plus className="mr-2 h-4 w-4" />
              Browse Accessories
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

