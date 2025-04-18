import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createTokenClient } from "@/lib/supabase-token"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { isFavorite } = await request.json()
  const accessoryID = params.id
  const url = request.url || ""
  const isPreviewMode = url.includes("preview_mode=true")

  // If in preview mode, return mock success response
  if (isPreviewMode) {
    console.log(`API: Preview mode detected, simulating favorite toggle of accessory ${accessoryID} to ${isFavorite}`)
    return NextResponse.json({
      success: true,
      message: `Accessory ${accessoryID} favorite status set to ${isFavorite} in preview mode`,
    })
  }

  // Check for Authorization header first (preview mode)
  const authHeader = request.headers.get("Authorization")

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]

    try {
      // Create a Supabase client with the token
      const { supabase, userId } = await createTokenClient(token)

      // Get the current profile data
      const { data: profileData, error: profileError } = await supabase
        .from("Profiles")
        .select("accessories")
        .eq("id", userId)
        .maybeSingle() // Use maybeSingle instead of single

      if (profileError) {
        console.error("Error fetching profile data:", profileError)
        return NextResponse.json({ error: profileError.message }, { status: 400 })
      }

      if (!profileData) {
        console.error("No profile data found for user:", userId)
        return NextResponse.json({ error: "Profile not found" }, { status: 404 })
      }

      // Update the accessory in the accessories array
      const accessories = profileData.accessories || []
      const updatedAccessories = accessories.map((accessory: any) => {
        if (accessory.accessoryID === accessoryID) {
          return { ...accessory, isFavorite }
        }
        return accessory
      })

      // Update the profile with the new accessories array
      const { error: updateError } = await supabase
        .from("Profiles")
        .update({ accessories: updatedAccessories })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating profile:", updateError)
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        data: { accessoryID, isFavorite },
      })
    } catch (error: any) {
      console.error("Error processing token:", error)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
  }

  // Fall back to cookie-based auth
  const supabase = createRouteHandlerClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Get current profile data
  const { data: profileData, error: profileError } = await supabase
    .from("Profiles")
    .select("accessories")
    .eq("id", session.user.id)
    .maybeSingle() // Use maybeSingle instead of single

  if (profileError) {
    console.error("Error fetching profile data:", profileError)
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  if (!profileData) {
    console.error("No profile data found for user:", session.user.id)
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  // Update the accessory in the accessories array
  const accessories = profileData.accessories || []
  const updatedAccessories = accessories.map((accessory: any) => {
    if (accessory.accessoryID === accessoryID) {
      return { ...accessory, isFavorite }
    }
    return accessory
  })

  // Update the profile with the new accessories array
  const { data, error } = await supabase
    .from("Profiles")
    .update({ accessories: updatedAccessories })
    .eq("id", session.user.id)
    .select()

  if (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({
    success: true,
    data: { accessoryID, isFavorite },
  })
}
