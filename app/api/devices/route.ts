import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the device data from the request
    const deviceData = await request.json()

    // Validate required fields
    if (!deviceData.deviceName || !deviceData.deviceType || !deviceData.serviceUUID) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert or update the device in the database
    const { data, error } = await supabase
      .from("user_devices")
      .upsert({
        user_id: user.id,
        device_name: deviceData.deviceName,
        device_type: deviceData.deviceType,
        service_uuid: deviceData.serviceUUID,
        friendly_name: deviceData.friendlyName || null,
        is_primary: deviceData.isPrimary || false,
        last_connected: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error saving device:", error)
      return NextResponse.json({ error: "Failed to save device" }, { status: 500 })
    }

    return NextResponse.json({ success: true, device: data[0] })
  } catch (error) {
    console.error("Error in device API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all devices for the user
    const { data, error } = await supabase
      .from("user_devices")
      .select("*")
      .eq("user_id", user.id)
      .order("last_connected", { ascending: false })

    if (error) {
      console.error("Error fetching devices:", error)
      return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 })
    }

    return NextResponse.json({ devices: data })
  } catch (error) {
    console.error("Error in device API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
