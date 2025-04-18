"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"

// Define the control center configuration type
interface ControlCenterConfig {
  version: number
  layout: string
  widgets: Array<{
    id: string
    accessoryId: string
    type: string
    position: {
      x: number
      y: number
    }
    size: {
      w: number
      h: number
    }
    settings?: Record<string, any>
  }>
}

export async function saveWidgetLayout(controlCenter: ControlCenterConfig) {
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
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Update the profile with the new control center configuration
    const { error: updateError } = await supabase
      .from("Profiles")
      .update({
        controlCenter: controlCenter,
      })
      .eq("id", session.user.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Revalidate paths
    revalidatePath("/control-center-v2")

    return { success: true }
  } catch (error) {
    console.error("Error saving widget layout:", error)
    return { success: false, error: "Unexpected error" }
  }
}

// Also export as default for server action compatibility
export default saveWidgetLayout
