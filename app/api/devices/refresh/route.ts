import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createTokenClient } from "@/lib/supabase-token"

export async function GET(request: Request) {
  try {
    // Check for Authorization header first (preview mode)
    const authHeader = request.headers.get("Authorization")

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
          .single()

        if (profileError) {
          return NextResponse.json({ error: profileError.message }, { status: 400 })
        }

        // Return the accessories array
        return NextResponse.json({ accessories: profileData.accessories || [] })
      } catch (error: any) {
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
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // Return the accessories array
    return NextResponse.json({ accessories: profileData.accessories || [] })
  } catch (error) {
    console.error("Error refreshing accessories:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
