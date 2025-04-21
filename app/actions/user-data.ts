"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

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

export async function getUserData(isPreviewMode = false) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    console.log("No session found, returning default data")
    return null
  }

  const { data, error } = await supabase.from("Profiles").select("*").eq("id", session.user.id).single()

  if (error) {
    console.error("Error getting user data:", error)
    throw error
  }

  return data
}

export async function updateDeviceStatus(id: string, active: boolean) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("Profiles")
    .update({ "devices[].deviceSupportStatus": active })
    .eq("id", session.user.id)
    .eq("devices[].id", id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateDeviceFavorite(id: string, isFavorite: boolean) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("Profiles")
    .update({ "devices[].isFavorite": isFavorite })
    .eq("id", session.user.id)
    .eq("devices[].id", id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateDeviceName(id: string, name: string, relayPosition?: string) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  const updates: any = { "devices[].deviceName": name }
  if (relayPosition !== undefined) {
    updates["devices[].relayPosition"] = relayPosition
  }

  const { data, error } = await supabase
    .from("Profiles")
    .update(updates)
    .eq("id", session.user.id)
    .eq("devices[].id", id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateGroupStatus(id: string, active: boolean) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("Profiles")
    .update({ "groups[].active": active })
    .eq("id", session.user.id)
    .eq("groups[].id", id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateBestTime(time: number) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase.from("Profiles").update({ bestTime: time }).eq("id", session.user.id).select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function saveTopTime(time: number, description: string) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  // Get the current profile data
  const { data: profileData, error: profileError } = await supabase
    .from("Profiles")
    .select("topTimesCaptured")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    return { error: profileError.message }
  }

  // Prepare the new top time entry
  const newTopTime = {
    time: time,
    date: new Date().toISOString(),
    description: description,
  }

  // Add the new top time to the existing array
  const topTimesCaptured = profileData?.topTimesCaptured || []
  const updatedTopTimes = [...topTimesCaptured, newTopTime]

  // Update the profile with the new top times array
  const { error: updateError } = await supabase
    .from("Profiles")
    .update({ topTimesCaptured: updatedTopTimes })
    .eq("id", session.user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath("/dashboard")
  return { success: true, topTimes: updatedTopTimes }
}

export async function editTopTimeDescription(index: number, description: string) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  // Get the current profile data
  const { data: profileData, error: profileError } = await supabase
    .from("Profiles")
    .select("topTimesCaptured")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    return { error: profileError.message }
  }

  // Get the current top times
  const topTimesCaptured = profileData?.topTimesCaptured || []

  // Check if the index is valid
  if (index < 0 || index >= topTimesCaptured.length) {
    return { error: "Invalid index" }
  }

  // Update the description
  topTimesCaptured[index].description = description

  // Update the profile with the new top times array
  const { error: updateError } = await supabase
    .from("Profiles")
    .update({ topTimesCaptured: topTimesCaptured })
    .eq("id", session.user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath("/dashboard")
  return { success: true, topTimes: topTimesCaptured }
}

export async function deleteTopTime(index: number) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  // Get the current profile data
  const { data: profileData, error: profileError } = await supabase
    .from("Profiles")
    .select("topTimesCaptured")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    return { error: profileError.message }
  }

  // Get the current top times
  const topTimesCaptured = profileData?.topTimesCaptured || []

  // Check if the index is valid
  if (index < 0 || index >= topTimesCaptured.length) {
    return { error: "Invalid index" }
  }

  // Remove the top time at the specified index
  topTimesCaptured.splice(index, 1)

  // Update the profile with the new top times array
  const { error: updateError } = await supabase
    .from("Profiles")
    .update({ topTimesCaptured: topTimesCaptured })
    .eq("id", session.user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath("/dashboard")
  return { success: true, topTimes: topTimesCaptured }
}
