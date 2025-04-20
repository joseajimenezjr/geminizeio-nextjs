import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a standard supabase client for browser usage
// (This is separate from the cookie-based clients created by the auth helpers)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Ensure the client looks for the session in the URL (for email confirmations)
    detectSessionInUrl: true,
    // Use a persistent session
    persistSession: true,
  },
})

// Re-export createClient for use elsewhere
export { createClient }
