"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Plus, Lightbulb, Wrench, Radio, Thermometer, Zap } from "lucide-react"
import Link from "next/link"
import { DashboardToggle } from "@/components/accessories/dashboard-toggle"
import { cn } from "@/lib/utils"

// Define the accessory type
interface Accessory {
  id: string
  name: string
  type: string
  location: string
  active: boolean
  isFavorite?: boolean
  deviceID?: string
  deviceConnectionStatus?: boolean
  deviceSupportStatus?: boolean
  relayPosition?: string | null
}

// Map accessory types to icons
const typeIcons = {
  light: Lightbulb,
  utility: Wrench,
  communication: Radio,
  sensor: Thermometer,
  power: Zap,
}

interface FavoriteAccessoriesProps {
  accessories: Accessory[]
}

export function FavoriteAccessories({ accessories }: FavoriteAccessoriesProps) {
  const [favoriteAccessories, setFavoriteAccessories] = useState(accessories)

  const handleToggle = (id: string, active: boolean) => {
    setFavoriteAccessories((prev) => prev.map((acc) => (acc.id === id ? { ...acc, active } : acc)))
  }

  // Get the appropriate icon for each accessory type
  const getIcon = (type: string) => {
    const lowerType = type.toLowerCase()
    return typeIcons[lowerType as keyof typeof typeIcons] || Lightbulb
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Favorite Accessories</CardTitle>
        <Star className="h-4 w-4 text-yellow-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{favoriteAccessories.length}</div>
        <p className="text-xs text-muted-foreground">Quick access to your favorite accessories</p>
        <div className="mt-4 space-y-3">
          {favoriteAccessories.map((accessory) => {
            const Icon = getIcon(accessory.type)
            return (
              <div
                key={accessory.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md transition-colors",
                  accessory.active ? "bg-primary/10" : "bg-background",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-1.5 rounded-md",
                      accessory.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{accessory.name}</span>
                    <span className="text-xs text-muted-foreground">{accessory.location}</span>
                  </div>
                </div>
                <DashboardToggle
                  accessoryID={accessory.deviceID || accessory.id}
                  isOn={accessory.deviceConnectionStatus || accessory.deviceSupportStatus || false}
                  relayPosition={accessory.relayPosition}
                />
              </div>
            )
          })}

          {favoriteAccessories.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">No favorite accessories yet</div>
          )}

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/accessories">
                <Lightbulb className="mr-2 h-4 w-4" />
                Manage Favorites
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/accessories/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
