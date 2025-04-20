"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"

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

export interface TopTimeEntry {
  time: number
  date: string
  description: string
}

// Update the function to avoid using cookies() when in preview mode
export async function getUserData(isPreviewMode?: boolean) {
  // Add this logging at the beginning of the getUserData function
  console.log("getUserData called")

  // If explicitly in preview mode, return mock data without using cookies
  if (isPreviewMode === true) {
    console.log("getUserData: Returning mock data for preview mode")
    return {
      id: "preview-user-id",
      email: "preview@example.com",
      firstName: "Preview",
      lastName: "User",
      vehicleName: "Preview Vehicle",
      vehicleType: "SUV",
      bestTime: 12345,
      topTimesCaptured: [
        {
          time: 12345,
          date: new Date().toISOString(),
          description: "First test run",
        },
        {
          time: 13500,
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          description: "Second test run",
        },
      ],
      accessories: [
        {
          accessoryID: "D001",
          accessoryName: "Light Bar",
          accessoryType: "light",
          accessoryConnectionStatus: false,
          isFavorite: true,
          relayPosition: "1",
        },
        {
          accessoryID: "D002",
          accessoryName: "Spot Lights",
          accessoryType: "light",
          accessoryConnectionStatus: false,
          isFavorite: false,
          relayPosition: "2",
        },
        {
          accessoryID: "D003",
          accessoryName: "Rock Lights",
          accessoryType: "light",
          accessoryConnectionStatus: false,
          isFavorite: false,
          relayPosition: "3",
        },
        {
          accessoryID: "D004",
          accessoryName: "Winch",
          accessoryType: "utility",
          accessoryConnectionStatus: false,
          isFavorite: false,
          relayPosition: "4",
        },
      ],
      groups: [
        {
          id: "G001",
          name: "Exterior Lights",
          active: false,
          devices: ["D001", "D002"],
        },
        {
          id: "G002",
          name: "Interior Lights",
          active: false,
          devices: ["D003"],
        },
        {
          id: "G003",
          name: "Utility",
          active: false,
          devices: ["D004"],
        },
      ],
      settings: {
        darkMode: false,
        notificationsEnabled: true,
        showFavorites: true,
      },
    }
  }

  try {
    // Only create the Supabase client and use cookies when needed
    const supabase = createServerActionClient({ cookies })
    console.log("getUserData: Creating Supabase client")

    console.log("getUserData: Checking for session")
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("getUserData: No session found")
      return null
    }

    console.log(`getUserData: Session found for user ${session.user.id}, email: ${session.user.email}`)
    console.log(`getUserData: Querying Profiles table with id = "${session.user.id}"`)

    const { data, error } = await supabase.from("Profiles").select("*").eq("id", session.user.id).maybeSingle() // Use maybeSingle instead of single

    if (error) {
      console.error("getUserData: Error fetching user data:", error)
      console.error("getUserData: Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return null
    }

    if (!data) {
      console.log("getUserData: No profile found for user:", session.user.id)

      // Return a default profile structure
      return {
        id: session.user.id,
        email: session.user.email,
        accessories: [],
        groups: [],
        topTimesCaptured: [],
        settings: {
          darkMode: false,
          notificationsEnabled: true,
          showFavorites: true,
        },
      }
    }

    console.log("getUserData: Successfully retrieved profile data")
    // Add this logging before returning the data
    console.log("getUserData returning:", data)
    return data
  } catch (error) {
    console.error("Error in getUserData:", error)
    return null
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
import { headers } from "next/headers"

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

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY, {
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
  console.log(`Server action: Updating user's best time to ${time}ms`)

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
      .select("bestTime")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Only update if the new time is better than the existing one
    const currentBestTime = profileData.bestTime
    if (currentBestTime === null || time < currentBestTime) {
      // Update the profile with the new best time
      const { error: updateError } = await supabase
        .from("Profiles")
        .update({ bestTime: time })
        .eq("id", session.user.id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }

      revalidatePath("/control-center-v2")
      return { success: true, previousBestTime: currentBestTime }
    }

    return { success: true, noBestTimeUpdate: true }
  } catch (error) {
    return { success: false, error: "Unexpected error" }
  }
}

// Save top time with description
export async function saveTopTime(time: number, description: string) {
  console.log(`Server action: Saving top time ${time}ms with description: "${description}"`)

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
      .select("topTimesCaptured")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Create the new top time entry
    const newTopTime = {
      time,
      date: new Date().toISOString(),
      description,
    }

    // Get existing top times or initialize empty array
    const topTimes = profileData.topTimesCaptured || []

    // Add the new time and sort by time (ascending)
    const updatedTopTimes = [...topTimes, newTopTime].sort((a, b) => a.time - b.time).slice(0, 10) // Keep only top 10

    // Update the profile with the new top times array
    const { error: updateError } = await supabase
      .from("Profiles")
      .update({ topTimesCaptured: updatedTopTimes })
      .eq("id", session.user.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    revalidatePath("/control-center-v2")
    return { success: true, topTimes: updatedTopTimes }
  } catch (error) {
    return { success: false, error: "Unexpected error" }
  }
}

// Edit top time description
export async function editTopTimeDescription(index: number, newDescription: string) {
  console.log(`Server action: Editing top time at index ${index} with new description: "${newDescription}"`)

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
      .select("topTimesCaptured")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Get existing top times
    const topTimes = profileData.topTimesCaptured || []

    // Check if the index is valid
    if (index < 0 || index >= topTimes.length) {
      return { success: false, error: "Invalid top time index" }
    }

    // Update the description at the specified index
    const updatedTopTimes = [...topTimes]
    updatedTopTimes[index] = {
      ...updatedTopTimes[index],
      description: newDescription,
    }

    // Update the profile with the modified top times array
    const { error: updateError } = await supabase
      .from("Profiles")
      .update({ topTimesCaptured: updatedTopTimes })
      .eq("id", session.user.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    revalidatePath("/control-center-v2")
    return { success: true, topTimes: updatedTopTimes }
  } catch (error) {
    return { success: false, error: "Unexpected error" }
  }
}

// Delete top time
export async function deleteTopTime(index: number) {
  console.log(`Server action: Deleting top time at index ${index}`)

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
      .select("topTimesCaptured")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // Get existing top times
    const topTimes = profileData.topTimesCaptured || []

    // Check if the index is valid
    if (index < 0 || index >= topTimes.length) {
      return { success: false, error: "Invalid top time index" }
    }

    // Remove the time at the specified index
    const updatedTopTimes = topTimes.filter((_, i) => i !== index)

    // Update the profile with the modified top times array
    const { error: updateError } = await supabase
      .from("Profiles")
      .update({ topTimesCaptured: updatedTopTimes })
      .eq("id", session.user.id)

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    revalidatePath("/control-center-v2")
    return { success: true, topTimes: updatedTopTimes }
  } catch (error) {
    return { success: false, error: "Unexpected error" }
  }
}
