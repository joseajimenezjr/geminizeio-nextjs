"use server"

import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { headers } from "next/headers"

export interface Device {
  accessoryID: string
  accessoryName: string
  accessoryType: string
  accessoryConnectionStatus: boolean
  isFavorite: boolean
  location?: string
  relayPosition?: string
}

export interface Group {
  id: string
  name: string
  active: boolean
  devices: string[]
}

interface TopTimeEntry {
  time: number
  date: string
  description: string
}

export async function getUserData() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return { error: profileError.message }
    }

    return {
      bestTimeCaptured: profile.best_time_captured || null,
      topTimesCaptured: profile.top_times_captured || [],
    }
  } catch (error) {
    console.error("Error in getUserData:", error)
    return { error: "Failed to get user data" }
  }
}

// Update device status
export async function updateDeviceStatus(accessoryID: string, status: boolean) {
  console.log(`Server action: Updating accessory ${accessoryID} status to ${status}`)

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
      .select("accessories")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Update the device in the devices array
    const accessories = profileData.accessories || []
    const updatedAccessories = accessories.map((accessory: any) =>
      accessory.accessoryID === accessoryID ? { ...accessory, accessoryConnectionStatus: status } : accessory,
    )

    // Update the profile with the new devices array
    const { error: updateError } = await supabase
      .from("Profiles")
      .update({ accessories: updatedAccessories })
      .eq("id", session.user.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    revalidatePath("/dashboard")
    revalidatePath("/accessories")
    revalidatePath("/lights")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Unexpected error" }
  }
}

// Update device favorite status
export async function updateDeviceFavorite(accessoryID: string, isFavorite: boolean) {
  console.log(`Server action: Updating accessory ${accessoryID} favorite to ${isFavorite}`)

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
      .select("accessories")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Update the device in the devices array
    const accessories = profileData.accessories || []
    const updatedAccessories = accessories.map((accessory: any) =>
      accessory.accessoryID === accessoryID ? { ...accessory, isFavorite } : accessory,
    )

    // Update the profile with the new devices array
    const { error: updateError } = await supabase
      .from("Profiles")
      .update({ accessories: updatedAccessories })
      .eq("id", session.user.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    revalidatePath("/dashboard")
    revalidatePath("/accessories")
    revalidatePath("/lights")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Unexpected error" }
  }
}

// Update group status
export async function updateGroupStatus(groupId: string, active: boolean) {
  console.log(`Server action: Updating group ${groupId} status to ${active}`)

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
      .select("groups")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Update the group in the groups array
    const groups = profileData.groups || []
    const updatedGroups = groups.map((group: any) => (group.id === groupId ? { ...group, active } : group))

    // Update the profile with the new groups array
    const { error: updateError } = await supabase
      .from("Profiles")
      .update({ groups: updatedGroups })
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

// Update device name

export async function updateDeviceName(accessoryID: string, accessoryName: string, relayPosition?: number | null) {
  console.log(
    `Server action: Updating accessory ${accessoryID} name to "${accessoryName}" and relay position to "${relayPosition}"`,
  )

  try {
    // Check for preview mode in the request headers
    const headersList = headers()
    const authHeader = headersList.get("Authorization")

    // If we have an auth header (preview mode), use it
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]

      try {
        // Create a Supabase client with the token
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_KEY) {
          throw new Error("Missing Supabase environment variables")
        }

        console.log("Preview mode detected, using token authentication")
        console.log(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
        console.log("Creating Supabase client with token")

        const supabase = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        })

        // Get the user from the token
        const { data: userData, error: userError } = await supabase.auth.getUser(token)

        if (userError || !userData.user) {
          console.error("Token validation error:", userError)
          return { success: false, error: userError?.message || "Invalid token" }
        }

        const userId = userData.user.id
        console.log("Found user with ID:", userId)
        console.log(`User authenticated with token: ${userId}, email: ${userData.user.email}`)

        // Get the current profile data
        console.log(`Querying Profiles table with id = "${userId}"`)
        const { data: profileData, error: profileError } = await supabase
          .from("Profiles")
          .select("accessories")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.error("Error fetching profile data:", profileError)
          return { success: false, error: profileError.message }
        }

        console.log("Raw Supabase response for profile data:", profileData)
        console.log("Profile data accessories:", profileData?.accessories)

        // Update the accessory name in the accessories array
        const accessories = profileData.accessories || []

        console.log("Current accessories from Supabase:", accessories)

        // Try to find the accessory
        const updatedAccessories = accessories.map((accessory: any) => {
          if (accessory.accessoryID === accessoryID) {
            console.log(`Found accessory to update:`, accessory)
            const updates = { ...accessory, accessoryName }

            // Only update relayPosition if it was provided
            if (relayPosition !== undefined) {
              updates.relayPosition = relayPosition
            }

            console.log(`Updating accessory with:`, updates)
            return updates
          }
          return accessory
        })

        console.log("Updated accessories array to send to Supabase:", updatedAccessories)

        // Check if we actually updated any accessory
        const accessoryWasUpdated = JSON.stringify(accessories) !== JSON.stringify(updatedAccessories)
        if (!accessoryWasUpdated) {
          console.error(`No accessory with ID ${accessoryID} was found to update`)
          return { success: false, error: "Accessory not found" }
        }

        // Update the profile with the new accessories array
        console.log(`Updating Supabase Profiles table for user ${userId} with updated accessories array`)
        const updateResult = await supabase
          .from("Profiles")
          .update({ accessories: updatedAccessories })
          .eq("id", userId)

        const { error: updateError } = updateResult

        // Log the complete update result
        console.log("Supabase update result:", updateResult)
        console.log("Raw Supabase update response:", updateResult)

        if (updateError) {
          console.error("Error updating profile:", updateError)
          return { success: false, error: updateError.message }
        }

        // Revalidate all potential paths where this data might be displayed
        revalidatePath("/dashboard")
        revalidatePath("/accessories")
        revalidatePath("/lights")

        console.log("Successfully updated accessory name")
        return { success: true, updatedAccessories }
      } catch (error: any) {
        console.error("Error in preview mode update:", error)
        return { success: false, error: error.message || "Error in preview mode update" }
      }
    }

    // Fall back to cookie-based auth
    const supabase = createServerActionClient({ cookies })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      console.error("No session found")
      return { success: false, error: "Not authenticated" }
    }

    console.log("Using cookie-based authentication")
    console.log(`User authenticated with session: ${session.user.id}, email: ${session.user.email}`)
    console.log(`Querying Profiles table with id = "${session.user.id}"`)

    // Get the current profile data
    const { data: profileData, error: profileError } = await supabase
      .from("Profiles")
      .select("accessories")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile data:", profileError)
      return { success: false, error: profileError.message }
    }

    console.log("Raw Supabase response for profile data:", profileData)
    console.log("Profile data accessories:", profileData?.accessories)

    // Update the accessory name in the accessories array
    const accessories = profileData.accessories || []

    console.log("Current accessories from Supabase:", accessories)

    // Try to find the accessory
    const updatedAccessories = accessories.map((accessory: any) => {
      if (accessory.accessoryID === accessoryID) {
        console.log(`Found accessory to update:`, accessory)
        const updates = { ...accessory, accessoryName }

        // Only update relayPosition if it was provided
        if (relayPosition !== undefined) {
          updates.relayPosition = relayPosition
        }

        console.log(`Updating accessory with:`, updates)
        return updates
      }
      return accessory
    })

    console.log("Updated accessories array to send to Supabase:", updatedAccessories)

    // Check if we actually updated any accessory
    const accessoryWasUpdated = JSON.stringify(accessories) !== JSON.stringify(updatedAccessories)
    if (!accessoryWasUpdated) {
      console.error(`No accessory with ID ${accessoryID} was found to update`)
      return { success: false, error: "Accessory not found" }
    }

    // Update the profile with the new accessories array
    console.log(`Updating Supabase Profiles table for user ${session.user.id} with updated accessories array`)
    const updateResult = await supabase
      .from("Profiles")
      .update({ accessories: updatedAccessories })
      .eq("id", session.user.id)

    const { error: updateError } = updateResult

    // Log the complete update result
    console.log("Supabase update result:", updateResult)
    console.log("Raw Supabase update response:", updateResult)

    if (updateError) {
      console.error("Error updating profile:", updateError)
      return { success: false, error: updateError.message }
    }

    // Revalidate all potential paths where this data might be displayed
    revalidatePath("/dashboard")
    revalidatePath("/accessories")
    revalidatePath("/lights")

    console.log("Successfully updated accessory name")
    return { success: true, updatedAccessories }
  } catch (error) {
    console.error("Unexpected error updating accessory name:", error)
    return { success: false, error: "Unexpected error" }
  }
}

// Update user's best time
export async function updateBestTime(time: number) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Update the user's best time
    const { error } = await supabase.from("profiles").update({ best_time_captured: time }).eq("id", user.id)

    if (error) {
      console.error("Error updating best time:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/control-center")
    return { success: true }
  } catch (error) {
    console.error("Error in updateBestTime:", error)
    return { success: false, error: "Failed to update best time" }
  }
}

// Save top time with description
export async function saveTopTime(time: number, description: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the user's current top times
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("top_times_captured")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return { success: false, error: profileError.message }
    }

    // Create a new top time entry
    const newTopTime: TopTimeEntry = {
      time,
      date: new Date().toISOString(),
      description,
    }

    // Add the new top time to the array
    let topTimes: TopTimeEntry[] = profile.top_times_captured || []
    topTimes.push(newTopTime)

    // Sort by time (ascending)
    topTimes.sort((a, b) => a.time - b.time)

    // Keep only the top 10
    if (topTimes.length > 10) {
      topTimes = topTimes.slice(0, 10)
    }

    // Update the user's top times
    const { error } = await supabase.from("profiles").update({ top_times_captured: topTimes }).eq("id", user.id)

    if (error) {
      console.error("Error updating top times:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/control-center")
    return { success: true, topTimes }
  } catch (error) {
    console.error("Error in saveTopTime:", error)
    return { success: false, error: "Failed to save top time" }
  }
}

// Edit top time description
export async function editTopTimeDescription(index: number, description: string) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the user's current top times
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("top_times_captured")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return { success: false, error: profileError.message }
    }

    // Update the description of the specified top time
    const topTimes: TopTimeEntry[] = profile.top_times_captured || []

    if (index < 0 || index >= topTimes.length) {
      return { success: false, error: "Invalid index" }
    }

    topTimes[index].description = description

    // Update the user's top times
    const { error } = await supabase.from("profiles").update({ top_times_captured: topTimes }).eq("id", user.id)

    if (error) {
      console.error("Error updating top times:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/control-center")
    return { success: true, topTimes }
  } catch (error) {
    console.error("Error in editTopTimeDescription:", error)
    return { success: false, error: "Failed to edit top time description" }
  }
}

// Delete top time
export async function deleteTopTime(index: number) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the user's current top times
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("top_times_captured")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return { success: false, error: profileError.message }
    }

    // Remove the specified top time
    const topTimes: TopTimeEntry[] = profile.top_times_captured || []

    if (index < 0 || index >= topTimes.length) {
      return { success: false, error: "Invalid index" }
    }

    topTimes.splice(index, 1)

    // Update the user's top times
    const { error } = await supabase.from("profiles").update({ top_times_captured: topTimes }).eq("id", user.id)

    if (error) {
      console.error("Error updating top times:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/control-center")
    return { success: true, topTimes }
  } catch (error) {
    console.error("Error in deleteTopTime:", error)
    return { success: false, error: "Failed to delete top time" }
  }
}
