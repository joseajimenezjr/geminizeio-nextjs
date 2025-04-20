import { Suspense } from "react"
import { Zap } from "lucide-react"
import { BottomNav } from "@/components/layout/bottom-nav"
import { getUserData } from "@/app/actions/user-data"
import { Card, CardContent } from "@/components/ui/card"
import { ClientDashboardContent } from "@/components/dashboard/client-dashboard-content"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { DashboardHeaderWrapper } from "@/components/dashboard/dashboard-header-wrapper"
import { PreviewModeIndicator } from "@/components/preview-mode-indicator"
import { BluetoothCardWrapper } from "@/components/dashboard/bluetooth-card-wrapper"
import { cookies } from "next/headers"
import { HashAuthHandler } from "@/components/auth/hash-auth-handler"
import { headers } from "next/headers"

export default async function DashboardPage() {
  // Near the top of the file, where we check for preview mode
  const cookieStore = cookies()
  const previewModeCookie = cookieStore.get("preview_mode")
  const previewMode = previewModeCookie?.value === "true"

  // Replace the URL parameters check with this more robust approach
  // Also check URL parameters - use a more robust approach
  const headersList = headers()
  const fullUrl = headersList.get("x-url") || ""
  console.log("Dashboard page - Full URL from headers:", fullUrl)

  // Check if the URL contains preview_mode=true
  const urlHasPreviewMode = fullUrl.includes("preview_mode=true")

  // Combined check
  const isInPreviewMode = previewMode || urlHasPreviewMode

  console.log("Dashboard page - Preview mode checks:", {
    previewModeCookie: previewModeCookie?.value,
    urlHasPreviewMode,
    isInPreviewMode,
    fullUrl,
  })

  // Log all cookies for debugging
  const allCookies = cookieStore.getAll()

  // Log for debugging
  console.log("Dashboard page - Cookie details:", {
    previewMode,
    previewModeCookie: previewModeCookie
      ? {
          name: previewModeCookie.name,
          value: previewModeCookie.value,
          path: previewModeCookie.path,
        }
      : null,
    allCookieNames: allCookies.map((c) => c.name),
  })

  // Update the getUserData call to EXPLICITLY pass the boolean value
  // Try to get user data, but always have a fallback
  let userData
  try {
    userData = await getUserData(isInPreviewMode === true)
    console.log("Dashboard page - getUserData called with:", isInPreviewMode)
  } catch (error) {
    console.error("Error getting user data:", error)
    userData = null
  }

  // Use default values if userData is null or missing properties
  const vehicleName = userData?.vehicle_name || userData?.vehicleName || "My Vehicle"
  const vehicleType = userData?.vehicle_type || userData?.vehicleType || ""
  const accessories = userData?.accessories || []
  const accessoryLimit = userData?.accessoryLimit || 4
  const showFavorites = userData?.settings?.showFavorites ?? true

  // Calculate active accessories count
  const activeAccessories = accessories.filter((accessory) => accessory.accessoryConnectionStatus).length

  return (
    <div className="flex min-h-screen flex-col pb-12 bg-gradient-to-b from-background to-muted/20">
      {/* This component extracts auth from URL hash */}
      <HashAuthHandler />

      {isInPreviewMode && <PreviewModeIndicator />}
      {/* Header */}
      <Suspense fallback={<div className="h-[104px] bg-background border-b"></div>}>
        <DashboardHeaderWrapper vehicleName={vehicleName} vehicleType={vehicleType} showFavorites={showFavorites} />
      </Suspense>

      {/* Main Content */}
      <main className="flex-1 container py-4 px-4">
        {/* Status Cards - now in a 2-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Bluetooth Connection Card */}
          <BluetoothCardWrapper />

          {/* Active Accessories Card */}
          <Card className="bg-gradient-to-br from-background to-muted/30 border-none shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">ACTIVE ACCESSORIES</p>
                <p className="text-2xl font-bold">
                  {activeAccessories} <span className="text-sm text-muted-foreground">/ {accessories.length}</span>
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wrap client components in Suspense */}
        <Suspense fallback={<LoadingSpinner />}>
          <ClientDashboardContent userData={userData} showFavorites={showFavorites} accessoryLimit={accessoryLimit} />
        </Suspense>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
