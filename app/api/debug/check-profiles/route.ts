import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    // Check for Authorization header first (preview mode)
    const authHeader = request.headers.get("Authorization")

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]

      try {
        // Create a Supabase client with the token
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_KEY) {
          throw new Error("Missing Supabase environment variables")
        }

        console.log("Creating admin Supabase client with service role key")
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        })

        // Get the user from the token
        const { data: userData, error: userError } = await supabase.auth.getUser(token)

        if (userError || !userData.user) {
          console.error("Token validation error:", userError)
          return NextResponse.json({ error: userError?.message || "Invalid token" }, { status: 401 })
        }

        const userId = userData.user.id
        console.log("Found user with ID:", userId)

        // Check what tables exist
        console.log("Checking available tables")
        const { data: tables, error: tablesError } = await supabase.rpc("get_tables")

        if (tablesError) {
          console.error("Error fetching tables:", tablesError)
        }

        // Check Profiles table structure
        console.log("Checking Profiles table structure")
        const { data: columns, error: columnsError } = await supabase
          .from("information_schema.columns")
          .select("column_name, data_type")
          .eq("table_name", "Profiles")
          .eq("table_schema", "public")

        if (columnsError) {
          console.error("Error fetching columns:", columnsError)
        }

        // Get the current profile data
        console.log(`Querying Profiles table with id = "${userId}"`)
        const { data: profileData, error: profileError } = await supabase
          .from("Profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.error("Error fetching profile data:", profileError)

          // Try a case-insensitive query as a fallback
          console.log("Trying case-insensitive query")
          const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
            .from("Profiles")
            .select("*")
            .ilike("id", userId)
            .single()

          if (caseInsensitiveError) {
            console.error("Case-insensitive query error:", caseInsensitiveError)
          }

          // Get a sample of profiles
          console.log("Getting sample of profiles")
          const { data: sampleProfiles, error: sampleError } = await supabase
            .from("Profiles")
            .select("id, email")
            .limit(5)

          if (sampleError) {
            console.error("Error fetching sample profiles:", sampleError)
          }

          return NextResponse.json(
            {
              error: profileError.message,
              tables: tables || [],
              columns: columns || [],
              userId,
              userEmail: userData.user.email,
              sampleProfiles: sampleProfiles || [],
            },
            { status: 404 },
          )
        }

        return NextResponse.json({
          success: true,
          tables: tables || [],
          columns: columns || [],
          profile: profileData,
          userId,
          userEmail: userData.user.email,
        })
      } catch (error: any) {
        console.error("Error in token-based auth:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
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

    console.log(`Authenticated as ${session.user.id}, email: ${session.user.email}`)

    // Check what tables exist
    console.log("Checking available tables")
    const { data: tables, error: tablesError } = await supabase.rpc("get_tables")

    if (tablesError) {
      console.error("Error fetching tables:", tablesError)
    }

    // Check Profiles table structure
    console.log("Checking Profiles table structure")
    const { data: columns, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_name", "Profiles")
      .eq("table_schema", "public")

    if (columnsError) {
      console.error("Error fetching columns:", columnsError)
    }

    // Get the current profile data
    console.log(`Querying Profiles table with id = "${session.user.id}"`)
    const { data: profileData, error: profileError } = await supabase
      .from("Profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile data:", profileError)

      // Get a sample of profiles
      console.log("Getting sample of profiles")
      const { data: sampleProfiles, error: sampleError } = await supabase.from("Profiles").select("id, email").limit(5)

      if (sampleError) {
        console.error("Error fetching sample profiles:", sampleError)
      }

      return NextResponse.json(
        {
          error: profileError.message,
          tables: tables || [],
          columns: columns || [],
          userId: session.user.id,
          userEmail: session.user.email,
          sampleProfiles: sampleProfiles || [],
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      tables: tables || [],
      columns: columns || [],
      profile: profileData,
      userId: session.user.id,
      userEmail: session.user.email,
    })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
