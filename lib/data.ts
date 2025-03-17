"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function updateDeviceStatus(deviceId: number, status: boolean) {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the current profile data
    const { data: profileData, error: profileError } = await supabase
      .from("Profiles")
      .select("devices")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Update the device in the devices array
    const devices = profileData.devices || []
    const updatedDevices = devices.map((device: any) =>
      device.id === deviceId ? { ...device, deviceSupportStatus: status } : device,
    )

    // Update the profile with the new devices array
    const { error: updateError } = await supabase
      .from("Profiles")
      .update({ devices: updatedDevices })
      .eq("id", session.user.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Unexpected error" }
  }
}

