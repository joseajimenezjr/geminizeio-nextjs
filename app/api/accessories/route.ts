import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const accessoryName = formData.get("accessoryName") as string
  const accessoryType = formData.get("accessoryType") as string
  const location = formData.get("location") as string
  const deviceUUID = (formData.get("deviceUUID") as string) || null
  const deviceName = (formData.get("deviceName") as string) || null

  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Generate a unique accessoryID
  const accessoryID = `A${Date.now().toString().slice(-6)}`

  // Get current profile data
  const { data: profileData, error: profileError } = await supabase
    .from("Profiles")
    .select("accessories, hubDetails")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  // Create the new accessory
  const newAccessory = {
    accessoryID,
    accessoryName,
    accessoryType,
    location,
    accessoryConnectionStatus: false,
    isFavorite: false,
    deviceUUID, // Store the UUID for future Bluetooth connections
    relayPosition: location.includes("Relay") ? Number.parseInt(location.replace("Relay ", "")) : null,
  }

  // Add the new accessory to the existing accessories array
  const accessories = profileData.accessories || []
  const updatedAccessories = [...accessories, newAccessory]

  // If we have device details, add them to hubDetails
  let hubDetails = profileData.hubDetails || []
  if (deviceUUID && deviceName) {
    // Check if this device is already in hubDetails
    const deviceExists = hubDetails.some(
      (device: any) => device.deviceName === deviceName && device.serviceName === deviceUUID,
    )

    if (!deviceExists) {
      hubDetails = [
        ...hubDetails,
        {
          deviceName,
          deviceType: accessoryType,
          serviceName: deviceUUID,
        },
      ]
    }
  }

  // Update the profile with the new accessories array and hubDetails
  const { data, error } = await supabase
    .from("Profiles")
    .update({
      accessories: updatedAccessories,
      hubDetails,
    })
    .eq("id", session.user.id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ data })
}
