"use client"

import { useAccessories } from "@/contexts/device-context"
import { Button } from "@/components/ui/button"
import { Lightbulb, Plus, RefreshCw } from "lucide-react"
import Link from "next/link"
import { DashboardToggle } from "@/components/accessories/dashboard-toggle"
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
              <div
                key={accessory.accessoryID}
                className="bg-black/80 rounded-lg overflow-hidden border border-gray-800"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium text-white">{accessory.accessoryName}</h3>
                    <AccessoryIcon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    {accessory.relayPosition ? `Relay ${accessory.relayPosition}` : "No location set"}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-400"></span>
                    <DashboardToggle
                      accessoryID={accessory.accessoryID}
                      isOn={accessory.accessoryConnectionStatus || false}
                      relayPosition={accessory.relayPosition?.toString()}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800"
                    onClick={() => handleAccessoryClick(accessory)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
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
