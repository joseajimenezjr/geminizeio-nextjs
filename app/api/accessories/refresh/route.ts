import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createTokenClient } from "@/lib/supabase-token"

export async function GET(request: Request) {
  try {
    // Check for Authorization header first (preview mode)
    const authHeader = request.headers.get("Authorization")
    const url = request.url || ""
    const isPreviewMode = url.includes("preview_mode=true")

    // If in preview mode, return mock data
    if (isPreviewMode) {
      console.log("API: Preview mode detected, returning mock data")
      return NextResponse.json({
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
      })
    }

    // If we have an auth header, use it
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]

      try {
        // Create a Supabase client with the token
        const { supabase, userId } = await createTokenClient(token)

        // Get the profile data using the user ID from the token
        const { data: profileData, error: profileError } = await supabase
          .from("Profiles")
          .select("accessories")
          .eq("id", userId)
          .maybeSingle() // Use maybeSingle instead of single to avoid errors

        if (profileError) {
          console.error("Error fetching profile data:", profileError)
          return NextResponse.json({ error: profileError.message }, { status: 400 })
        }

        // If no profile data was found, return an empty array
        if (!profileData) {
          console.log("No profile data found for user:", userId)
          return NextResponse.json({ accessories: [] })
        }

        // Return the accessories array
        return NextResponse.json({ accessories: profileData.accessories || [] })
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

    // Get the current profile data
    const { data: profileData, error: profileError } = await supabase
      .from("Profiles")
      .select("accessories")
      .eq("id", session.user.id)
      .maybeSingle() // Use maybeSingle instead of single to avoid errors

    if (profileError) {
      console.error("Error fetching profile data:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // If no profile data was found, return an empty array
    if (!profileData) {
      console.log("No profile data found for user:", session.user.id)
      return NextResponse.json({ accessories: [] })
    }

    // Return the accessories array
    return NextResponse.json({ accessories: profileData.accessories || [] })
  } catch (error) {
    console.error("Error refreshing accessories:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
