"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function updateUserSettings(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  const darkMode = formData.get("darkMode") === "true"
  const notificationsEnabled = formData.get("notificationsEnabled") === "true"
  const showFavorites = formData.get("showFavorites") === "true"

  // Get the current profile data
  const { data: profileData, error: profileError } = await supabase
    .from("Profiles")
    .select("settings")
    .eq("id", session.user.id)
    .single()

  if (profileError && profileError.code !== "PGRST116") {
    return { error: profileError.message }
  }

  // Prepare the settings object
  const currentSettings = profileData?.settings || {}
  const updatedSettings = {
    ...currentSettings,
    darkMode,
    notificationsEnabled,
    showFavorites,
    updatedAt: new Date().toISOString(),
  }

  // Update the profile with the new settings
  const { error: updateError } = await supabase
    .from("Profiles")
    .update({ settings: updatedSettings })
    .eq("id", session.user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath("/settings")
  revalidatePath("/dashboard")
  return { success: true }
}

// Add the new updateVehicleInfo function
export async function updateVehicleInfo(formData: FormData) {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return { error: "Not authenticated" }
    }

    const vehicleName = formData.get("vehicleName") as string
    const vehicleType = formData.get("vehicleType") as string
    const vehicleYear = formData.get("vehicleYear") as string

    console.log("Updating vehicle info:", { vehicleName, vehicleType, vehicleYear })

    // Update the profile with the new vehicle information
    // Use the correct field names that match the database columns
    const { error: updateError } = await supabase
      .from("Profiles")
      .update({
        vehicle_name: vehicleName,
        vehicle_type: vehicleType,
        vehicle_year: vehicleYear,
      })
      .eq("id", session.user.id)

    if (updateError) {
      console.error("Error updating vehicle info:", updateError)
      return { error: updateError.message }
    }

    // Log success for debugging
    console.log("Vehicle info updated successfully")

    // Force revalidation of all relevant paths
    revalidatePath("/settings")
    revalidatePath("/dashboard")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error updating vehicle info:", error)
    return { error: "Unexpected error" }
  }
}
