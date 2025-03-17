"use client"

import { GroupsList } from "@/components/dashboard/groups-list"
import { AccessoriesList } from "@/components/dashboard/accessories-list"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Bug, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SessionChecker } from "@/components/debug/session-checker"
import { DatabaseChecker } from "@/components/debug/database-checker"
import { FavoritesTab } from "@/components/dashboard/favorites-tab"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { DeviceDetailsDialog } from "@/components/accessories/device-details-dialog"
import { useAccessories } from "@/contexts/device-context"
import { DeviceStateDebugger } from "@/components/debug/device-state-debugger"

export function ClientDashboardContent({
  userData,
  showFavorites = true,
  accessoryLimit = 4,
}: {
  userData: any
  showFavorites?: boolean
  accessoryLimit?: number
}) {
  const { accessories, refreshAccessories, isLoading } = useAccessories()
  const [isDebugExpanded, setIsDebugExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedAccessory, setSelectedAccessory] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const groups = userData?.groups || []

  // Get debug mode from localStorage on client side only
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false)

  // Initialize debug mode
  useEffect(() => {
    const storedDebugMode = localStorage.getItem("geminize-debug-mode")
    if (storedDebugMode === "true") {
      setIsDebugMode(true)
    }
  }, [])

  // Listen for tab change events from the header
  useEffect(() => {
    const handleTabChange = (event: any) => {
      setActiveTab(event.detail.tab)
    }

    window.addEventListener("tabchange", handleTabChange)
    return () => {
      window.removeEventListener("tabchange", handleTabChange)
    }
  }, [])

  // Refresh accessories when the component mounts
  useEffect(() => {
    refreshAccessories()
  }, [refreshAccessories])

  const handleAccessoryClick = (accessory: any) => {
    setSelectedAccessory(accessory)
    setDialogOpen(true)
  }

  const isRefreshing = isLoading.refresh || false

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Control Center</h2>
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

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="dashboard" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2">
            <GroupsList initialGroups={groups} />
            <AccessoriesList onDeviceClick={handleAccessoryClick} />
          </div>
        </TabsContent>

        {showFavorites && (
          <TabsContent value="favorites" className="mt-0">
            <FavoritesTab onDeviceClick={handleAccessoryClick} />
          </TabsContent>
        )}
      </Tabs>

      {/* Accessory Details Dialog */}
      {selectedAccessory && (
        <DeviceDetailsDialog
          device={selectedAccessory}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          accessoryLimit={accessoryLimit}
        />
      )}

      {/* Debug Tools */}
      {isDebugMode && (
        <div className="mt-6 border border-amber-500 rounded-lg overflow-hidden bg-background">
          <div className="bg-amber-500/10 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-600 font-medium">
              <Bug className="h-4 w-4" />
              <span>Debug Tools</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDebugExpanded(!isDebugExpanded)}
              className="h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-500/20"
            >
              {isDebugExpanded ? <X className="h-4 w-4" /> : "Expand"}
            </Button>
          </div>

          {isDebugExpanded && (
            <div className="p-4">
              <SessionChecker />
              <DatabaseChecker />

              {/* Debug Data Display */}
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <details>
                    <summary className="cursor-pointer font-medium">User Data</summary>
                    <pre className="mt-2 bg-muted p-2 rounded-md overflow-auto text-xs">
                      {JSON.stringify(userData, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Add the accessory state debugger */}
      <DeviceStateDebugger />
    </>
  )
}

