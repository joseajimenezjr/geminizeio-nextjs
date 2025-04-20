import { getUserData } from "@/app/actions/user-data"
import { ControlCenterV2 } from "@/components/control-center-v2/control-center"
import { DashboardHeaderWrapper } from "@/components/dashboard/dashboard-header-wrapper"
import { BottomNav } from "@/components/layout/bottom-nav"

export const dynamic = "force-dynamic"

export default async function ControlCenterV2Page() {
  // Get user data
  const userData = await getUserData()
  console.log("Control Center V2 - userData:", JSON.stringify(userData, null, 2))

  if (!userData) {
    return (
      <div className="container px-4 py-8">
        <h1 className="text-2xl font-bold">Not authenticated</h1>
        <p>Please log in to view this page.</p>
      </div>
    )
  }

  // Check both camelCase and snake_case property names to be safe
  const vehicleName = userData.vehicleName || userData.vehicle_name || "My Vehicle"
  const vehicleType = userData.vehicleType || userData.vehicle_type || "Vehicle"

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <DashboardHeaderWrapper
        vehicleName={vehicleName}
        vehicleType={vehicleType}
        showFavorites={userData.settings?.showFavorites ?? true}
      />

      <div className="container px-4 py-4 flex-1">
        <ControlCenterV2 userData={userData} />
      </div>

      <BottomNav />
    </main>
  )
}
