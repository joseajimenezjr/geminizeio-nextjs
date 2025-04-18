"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createGroup(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  const name = formData.get("name") as string

  const { data, error } = await supabase
    .from("accessory_groups")
    .insert({
      user_id: session.user.id,
      name,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { data }
}

export async function addAccessoryToGroup(groupId: string, accessoryId: string) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  // First verify the user owns both the group and the accessory
  const { data: group, error: groupError } = await supabase
    .from("accessory_groups")
    .select()
    .eq("id", groupId)
    .eq("user_id", session.user.id)
    .single()

  if (groupError || !group) {
    return { error: "Group not found or access denied" }
  }

  const { data: accessory, error: accessoryError } = await supabase
    .from("accessories")
    .select()
    .eq("id", accessoryId)
    .eq("user_id", session.user.id)
    .single()

  if (accessoryError || !accessory) {
    return { error: "Accessory not found or access denied" }
  }

  // Now add the accessory to the group
  const { data, error } = await supabase
    .from("accessory_group_items")
    .insert({
      group_id: groupId,
      accessory_id: accessoryId,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { data }
}
