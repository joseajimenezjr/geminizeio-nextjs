"use client"

import { useAccessories } from "@/contexts/device-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Plus, RefreshCw } from "lucide-react"
import Link from "next/link"
import { DashboardToggle } from "@/components/accessories/dashboard-toggle"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { DeviceDetailsDialog } from "@/components/accessories/device-details-dialog"

// Helper function to get the appropriate icon for each accessory type
function getAccessoryIcon(type: string) {
  const accessoryType = type?.toLowerCase() || ""
  if (accessoryType.includes("light")) return Lightbulb
  if (accessoryType.includes("utility")) return Wrench
  if (accessoryType.includes("communication")) return Radio
  if (accessoryType.includes("sensor")) return Thermometer
  if (accessoryType.includes("power")) return Zap
  return Lightbulb // Default
}

import { Wrench, Radio, Thermometer, Zap } from "lucide-react"

export function AccessoriesPageContent() {
  const { accessories, refreshAccessories, isLoading } = useAccessories()
  const [selectedAccessory, setSelectedAccessory] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Refresh accessories when the component mounts
  useEffect(() => {
    refreshAccessories()
  }, [refreshAccessories])

  // Update the card click handler to prevent conflicts with toggle clicks
  const handleAccessoryClick = (accessory: any) => {
    setSelectedAccessory(accessory)
    setDialogOpen(true)
  }

  const isRefreshing = isLoading.refresh || false

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">All Accessories</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshAccessories()}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accessories.length > 0 ? (
          accessories.map((accessory) => {
            const AccessoryIcon = getAccessoryIcon(accessory.accessoryType)
            return (
              <Card
                key={accessory.accessoryID}
                className={accessory.accessoryConnectionStatus ? "border-primary/20" : ""}
                onClick={(e) => {
                  // Only open the dialog if the click wasn't on a child interactive element
                  if (e.target === e.currentTarget || !e.defaultPrevented) {
                    handleAccessoryClick(accessory)
                  }
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">{accessory.accessoryName}</CardTitle>
                  <AccessoryIcon
                    className={cn(
                      "h-5 w-5",
                      accessory.accessoryConnectionStatus ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">{accessory.location || "No location set"}</span>
                    <DashboardToggle id={accessory.accessoryID} />
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/accessories/${accessory.accessoryID}`}>Edit</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-12 col-span-full">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Accessories Found</h2>
            <p className="text-muted-foreground mb-6">You haven't added any accessories yet.</p>
            <Button asChild>
              <Link href="/accessories/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Accessory
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Accessory Details Dialog */}
      {selectedAccessory && (
        <DeviceDetailsDialog device={selectedAccessory} open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
    </>
  )
}

