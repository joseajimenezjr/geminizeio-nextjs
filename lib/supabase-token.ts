import { createClient } from "@supabase/supabase-js"

// Function to create a Supabase client with a token
export async function createTokenClient(token: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables")
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  // Get the user from the token
  const { data: userData, error: userError } = await supabase.auth.getUser(token)

  if (userError || !userData.user) {
    throw new Error(userError?.message || "Invalid token")
  }

  return {
    supabase,
    userId: userData.user.id,
    userEmail: userData.user.email,
  }
}
