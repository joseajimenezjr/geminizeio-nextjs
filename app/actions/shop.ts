"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getShopProducts() {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase.from("Accessories").select("*").in("status", ["available", "coming-soon"])

  if (error) {
    console.error("Error fetching shop products:", error)
    return { error: error.message }
  }

  return { data }
}
