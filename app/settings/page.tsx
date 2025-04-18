import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies, headers } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserData } from "@/app/actions/user-data"
import { BottomNav } from "@/components/layout/bottom-nav"
import { SettingsForm } from "@/components/settings/settings-form"
import { SignOutSection } from "@/components/settings/sign-out-section"
import { ClientDebugTools } from "@/components/debug/client-debug-tools"
import { PreviewModeIndicator } from "@/components/preview-mode-indicator"
import { VehicleInfoForm } from "@/components/settings/vehicle-info-form"

export default async function SettingsPage() {
  // Check for preview mode in URL or cookies
  const cookieStore = cookies()
  const previewCookie = cookieStore.get("preview_mode")
  const isPreviewMode = previewCookie?.value === "true"

  // Also check URL parameters - use a more robust approach
  const headersList = headers()
  const fullUrl = headersList.get("x-url") || ""
  console.log("Settings page - Full URL from headers:", fullUrl)

  // Check if the URL contains preview_mode=true
  const urlHasPreviewMode = fullUrl.includes("preview_mode=true")

  // Combined check
  const isInPreviewMode = isPreviewMode || urlHasPreviewMode

  console.log("Settings page - Preview mode checks:", {
    previewCookie: previewCookie?.value,
    urlHasPreviewMode,
    isInPreviewMode,
    fullUrl,
  })

  // If not in preview mode, check authentication
  if (!isInPreviewMode) {
    const supabase = createServerComponentClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("Settings page: No session found, redirecting to login")
      redirect("/")
    }
  } else {
    console.log("Settings page: Preview mode detected, skipping auth check")
  }

  // Get user data - EXPLICITLY pass the boolean value
  let userData
  try {
    userData = await getUserData(isInPreviewMode === true)
    console.log("Settings page - getUserData called with:", isInPreviewMode)
  } catch (error) {
    console.error("Error getting user data:", error)
    userData = null
  }

  return (
    <div className="flex min-h-screen flex-col pb-16">
      {isInPreviewMode && <PreviewModeIndicator />}

      <main className="flex-1 container py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Email Address</div>
                <div className="text-sm text-muted-foreground">
                  {userData?.email || (isInPreviewMode ? "Preview Mode User" : "Not available")}
                </div>
              </div>
              <Button variant="outline">Change Password</Button>
            </CardContent>
          </Card>

          {/* Add the Vehicle Information card */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>Update your vehicle details</CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleInfoForm userData={userData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm userData={userData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device Settings</CardTitle>
              <CardDescription>Configure your relay controller settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Device ID</div>
                <div className="text-sm text-muted-foreground">GEM-12345</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Firmware Version</div>
                <div className="text-sm text-muted-foreground">v1.2.0</div>
              </div>
              <Button variant="outline">Check for Updates</Button>
            </CardContent>
          </Card>

          <SignOutSection />

          {/* Developer Tools - Only shown in debug mode */}
          <ClientDebugTools />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
