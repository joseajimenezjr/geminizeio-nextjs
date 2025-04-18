"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createAccessory(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  const name = formData.get("name") as string
  const type = formData.get("type") as string
  const location = formData.get("location") as string

  const { data, error } = await supabase
    .from("accessories")
    .insert({
      user_id: session.user.id,
      name,
      type,
      location,
      active: false,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/accessories")
  return { data }
}

export async function toggleAccessory(id: string, active: boolean) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("accessories")
    .update({ active })
    .eq("id", id)
    .eq("user_id", session.user.id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/accessories")
  return { data }
}

export async function deleteAccessory(id: string) {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("accessories").delete().eq("id", id).eq("user_id", session.user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/accessories")
  return { success: true }
}
