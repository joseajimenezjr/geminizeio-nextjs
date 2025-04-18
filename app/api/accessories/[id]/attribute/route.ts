import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

interface Params {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const accessoryId = params.id
    const { attributeName, value } = await request.json()

    // Validate input
    if (!accessoryId || !attributeName) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get the user session
    const supabase = createServerComponentClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = session.user.id

    // Get the current profile data
    const { data: profileData, error: profileError } = await supabase
      .from("Profiles")
      .select("accessories")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return NextResponse.json({ error: "Error fetching profile" }, { status: 500 })
    }

    // Find and update the accessory
    const accessories = profileData.accessories || []
    const updatedAccessories = accessories.map((accessory: any) => {
      if (accessory.accessoryID === accessoryId) {
        return {
          ...accessory,
          [attributeName]: value,
        }
      }
      return accessory
    })

    // Update the profile with the modified accessories
    const { error: updateError } = await supabase
      .from("Profiles")
      .update({ accessories: updatedAccessories })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating profile:", updateError)
      return NextResponse.json({ error: "Error updating profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Attribute ${attributeName} updated for accessory ${accessoryId}`,
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
