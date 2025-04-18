import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getUserData } from "@/app/actions/user-data"
import { LightsPageContent } from "@/components/lights/lights-page-content"

export default async function LightsPage() {
  // Get user data
  let userData
  try {
    userData = await getUserData()
  } catch (error) {
    console.error("Error getting user data:", error)
    userData = null
  }

  // Get all devices
  // const devices = userData?.devices || []

  // return (
  //   <DeviceProvider initialDevices={devices}>
  //     <div className="flex min-h-screen flex-col pb-16">
  //       <Header />
  //       <main className="flex-1 container py-6">
  //         <div className="flex items-center justify-between mb-6">
  //           <h1 className="text-3xl font-bold">Lights</h1>
  //           <Button asChild>
  //             <Link href="/accessories/new">
  //               <Plus className="mr-2 h-4 w-4" />
  //               Add Light
  //             </Link>
  //           </Button>
  //         </div>

  //         <LightsPageContent />
  //       </main>
  //       <BottomNav />
  //     </div>
  //   </DeviceProvider>
  // )
  return (
    <div className="flex min-h-screen flex-col pb-16">
      <Header />
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Lights</h1>
          <Button asChild>
            <Link href="/accessories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Light
            </Link>
          </Button>
        </div>

        <LightsPageContent />
      </main>
      <BottomNav />
    </div>
  )
}
