import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Create a Supabase client with the service role key to ensure full access
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_KEY!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // First validate the token by getting the user
    const { data: userData, error: userError } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      console.error("User validation error:", userError)
      return NextResponse.json({ error: userError?.message || "Invalid token" }, { status: 401 })
    }

    const userId = userData.user.id
    console.log("Found user with ID:", userId)

    // First, let's check what tables exist in the database
    const { data: tables, error: tablesError } = await supabase.rpc("get_tables")

    if (tablesError) {
      console.error("Error fetching tables:", tablesError)
    } else {
      console.log("Available tables:", tables)
    }

    // Now let's check the structure of the Profiles table
    const { data: profileColumns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", "Profiles")
      .eq("table_schema", "public")

    if (columnsError) {
      console.error("Error fetching Profiles columns:", columnsError)
    } else {
      console.log("Profiles table columns:", profileColumns)
    }

    // Check if the user has a profile - with detailed logging
    console.log(`Querying Profiles table for user with id = "${userId}"`)
    const { data: profileData, error: profileError } = await supabase
      .from("Profiles")
      .select("*")
      .eq("id", userId)
      .single()

    console.log("Profile query result:", { profileData, profileError })

    if (profileError) {
      // Log more details about the error
      console.error("Profile lookup error:", {
        error: profileError,
        userId: userId,
        errorCode: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      })

      // If it's specifically a not found error
      if (profileError.code === "PGRST116") {
        // Try a case-insensitive query as a fallback
        console.log("Trying case-insensitive query as fallback")
        const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
          .from("Profiles")
          .select("*")
          .ilike("id", userId)
          .single()

        if (!caseInsensitiveError && caseInsensitiveData) {
          console.log("Found profile with case-insensitive query:", caseInsensitiveData)
          return NextResponse.json({
            success: true,
            user: {
              id: userId,
              email: userData.user.email,
              profile: caseInsensitiveData,
            },
          })
        }

        // Let's also try to query all profiles to see what's available
        const { data: allProfiles, error: allProfilesError } = await supabase.from("Profiles").select("id").limit(10)

        if (!allProfilesError) {
          console.log("Sample of available profiles:", allProfiles)
        }

        return NextResponse.json(
          {
            error: "Profile not found. Please ensure you've signed in normally first.",
            code: "profile_not_found",
            details: {
              id: userId, // Use "id" instead of "userId" to match the database column
              email: userData.user.email,
            },
          },
          { status: 404 },
        )
      }

      // For other database errors
      return NextResponse.json(
        {
          error: "Database error while looking up profile",
          details: profileError.message,
        },
        { status: 500 },
      )
    }

    // Profile found - return success with user info
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: userData.user.email,
        profile: profileData, // Include the profile data for debugging
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in token validation:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
