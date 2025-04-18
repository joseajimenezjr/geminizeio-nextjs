import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies, headers } from "next/headers"
import { BottomNav } from "@/components/layout/bottom-nav"
import { getUserData } from "@/app/actions/user-data"
import { DashboardHeaderWrapper } from "@/components/dashboard/dashboard-header-wrapper"
import { Suspense } from "react"
import { AccessoriesPageContent } from "@/components/accessories/accessories-page-content"

export default async function AccessoriesPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Near the top of the file, add preview mode detection
  const cookieStore = cookies()
  const previewCookie = cookieStore.get("preview_mode")
  const isPreviewMode = previewCookie?.value === "true"

  // Replace the URL parameters check with this more robust approach
  // Also check URL parameters - use a more robust approach
  const headersList = headers()
  const fullUrl = headersList.get("x-url") || ""
  console.log("Accessories page - Full URL from headers:", fullUrl)

  // Check if the URL contains preview_mode=true
  const urlHasPreviewMode = fullUrl.includes("preview_mode=true")

  // Combined check
  const isInPreviewMode = isPreviewMode || urlHasPreviewMode

  console.log("Accessories page - Preview mode checks:", {
    previewCookie: previewCookie?.value,
    urlHasPreviewMode,
    isInPreviewMode,
    fullUrl,
  })

  // Get user data - EXPLICITLY pass the boolean value
  let userData
  try {
    userData = await getUserData(isInPreviewMode === true)
    console.log("Accessories page - getUserData called with:", isInPreviewMode)
  } catch (error) {
    console.error("Error getting user data:", error)
    userData = null
  }

  // Get all devices
  const devices = userData?.devices || []

  // Use default values if userData is null or missing properties
  const vehicleName = userData?.vehicle_name || userData?.vehicleName || "My Vehicle"
  const vehicleType = userData?.vehicle_type || userData?.vehicleType || ""
  const showFavorites = userData?.settings?.showFavorites ?? true

  return (
    <div className="flex min-h-screen flex-col pb-16 bg-black">
      {/* Header - same as dashboard */}
      <Suspense fallback={<div className="h-[64px] bg-black border-b border-gray-800"></div>}>
        <DashboardHeaderWrapper vehicleName={vehicleName} vehicleType={vehicleType} showFavorites={showFavorites} />
      </Suspense>

      <main className="flex-1 container py-4 px-4">
        <AccessoriesPageContent />
      </main>
      <BottomNav />
    </div>
  )
}
