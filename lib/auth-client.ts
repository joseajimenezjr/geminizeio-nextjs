"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"

export function useSupabaseClient() {
  const [isReady, setIsReady] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we have a token in localStorage
      const token = localStorage.getItem("supabase_access_token")

      if (token) {
        // Set the session with the token
        try {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: "",
          })
          console.log("Session set from localStorage token")
        } catch (error) {
          console.error("Error setting session from token:", error)
        }
      }

      setIsReady(true)
    }

    initializeAuth()
  }, [supabase.auth])

  return { supabase, isReady }
}
