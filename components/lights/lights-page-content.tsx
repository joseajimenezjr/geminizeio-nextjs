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

export function LightsPageContent() {
  const { accessories, refreshAccessories, isLoading } = useAccessories()
  const [selectedAccessory, setSelectedAccessory] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Refresh accessories when the component mounts
  useEffect(() => {
    refreshAccessories()
  }, [refreshAccessories])

  // Filter accessories to only include lights
  const lightAccessories = accessories.filter((accessory) => accessory.accessoryType?.toLowerCase().includes("light"))

  const handleAccessoryClick = (accessory: any) => {
    setSelectedAccessory(accessory)
    setDialogOpen(true)
  }

  const isRefreshing = isLoading.refresh || false

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Light Accessories</h2>
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

      {lightAccessories.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lightAccessories.map((light) => (
            <Card
              key={light.accessoryID}
              className={light.accessoryConnectionStatus ? "border-primary" : ""}
              onClick={(e) => {
                // Only open the dialog if the click wasn't on a child interactive element
                if (e.target === e.currentTarget || !e.defaultPrevented) {
                  handleAccessoryClick(light)
                }
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{light.accessoryName}</CardTitle>
                <Lightbulb
                  className={cn(
                    "h-5 w-5",
                    light.accessoryConnectionStatus ? "text-yellow-400" : "text-muted-foreground",
                  )}
                />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">{light.location || "No location set"}</span>
                  <DashboardToggle id={light.accessoryID} />
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/accessories/${light.accessoryID}`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Lights Found</h2>
          <p className="text-muted-foreground mb-6">You haven't added any lights yet.</p>
          <Button asChild>
            <Link href="/accessories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Light
            </Link>
          </Button>
        </div>
      )}

      {/* Accessory Details Dialog */}
      {selectedAccessory && (
        <DeviceDetailsDialog device={selectedAccessory} open={dialogOpen} onOpenChange={setDialogOpen} />
      )}
    </>
  )
}
