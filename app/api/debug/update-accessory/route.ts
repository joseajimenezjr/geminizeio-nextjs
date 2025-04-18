import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { accessoryID, accessoryName, status } = await request.json()

    console.log(`Debug API: Attempting to update accessory ${accessoryID}`)
    if (accessoryName) {
      console.log(`Debug API: Updating name to "${accessoryName}"`)
    }
    if (status !== undefined) {
      console.log(`Debug API: Updating status to ${status ? "Connected" : "Not Connected"}`)
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !sessionData.session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Get current accessories
    const { data: profileData, error: profileError } = await supabase
      .from("Profiles") // This is the table name
      .select("accessories")
      .eq("id", sessionData.session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { success: false, error: profileError.message, step: "fetching profile" },
        { status: 400 },
      )
    }

    const accessories = profileData.accessories || []

    // Log the full accessories array structure for debugging
    console.log(`Found ${accessories.length} accessories in profile`)

    // Try to find the accessory
    let foundAccessory = false
    const updatedAccessories = accessories.map((accessory: any) => {
      if (accessory.accessoryID === accessoryID) {
        foundAccessory = true
        console.log(`Found accessory to update:`, accessory)

        const updatedAccessory = { ...accessory }

        // Update name if provided
        if (accessoryName) {
          updatedAccessory.accessoryName = accessoryName
        }

        // Update status if provided
        if (status !== undefined) {
          updatedAccessory.accessoryConnectionStatus = status
        }

        return updatedAccessory
      }
      return accessory
    })

    if (!foundAccessory) {
      console.log(
        "Accessory not found. Available accessories:",
        accessories.map((a: any) => ({
          id: a.accessoryID,
          name: a.accessoryName,
        })),
      )

      return NextResponse.json(
        {
          success: false,
          error: "Accessory not found",
          accessoryID,
          accessories, // Return full accessories array
          totalAccessories: accessories.length,
        },
        { status: 404 },
      )
    }

    // Update in Supabase
    const { error: updateError } = await supabase
      .from("Profiles") // This is the table name again
      .update({ accessories: updatedAccessories })
      .eq("id", sessionData.session.user.id)

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message, step: "updating profile" },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Accessory updated successfully",
      accessories: updatedAccessories, // Return full updated accessories array
    })
  } catch (error: any) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 })
  }
}
