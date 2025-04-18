import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// DELETE handler to remove an accessory
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const accessoryID = params.id

  if (!accessoryID) {
    return NextResponse.json({ error: "Accessory ID is required" }, { status: 400 })
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the current profile data
    const { data: profileData, error: profileError } = await supabase
      .from("Profiles")
      .select("accessories")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Filter out the accessory to be deleted
    const accessories = profileData.accessories || []
    const updatedAccessories = accessories.filter((accessory: any) => accessory.accessoryID !== accessoryID)

    // If the arrays have the same length, the accessory wasn't found
    if (accessories.length === updatedAccessories.length) {
      return NextResponse.json({ error: "Accessory not found" }, { status: 404 })
    }

    // Update the profile with the new accessories array
    const { error: updateError } = await supabase
      .from("Profiles")
      .update({ accessories: updatedAccessories })
      .eq("id", session.user.id)

    if (updateError) {
      console.error("Error updating profile:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Accessory removed successfully",
      updatedAccessories,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
