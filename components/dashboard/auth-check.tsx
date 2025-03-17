"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export function AuthCheck() {
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          console.log("No session found in client component, redirecting to login")
          router.push("/")
        } else {
          console.log("Session confirmed in client component")

          // Set a cookie to indicate we're logged in
          document.cookie = "justLoggedIn=true; path=/; max-age=60"
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setChecking(false)
      }
    }

    // Check if we just logged in
    const justLoggedIn = localStorage.getItem("justLoggedIn") === "true"
    if (justLoggedIn) {
      console.log("Just logged in flag found")
      // Remove the flag
      localStorage.removeItem("justLoggedIn")
      // Set a cookie to indicate we're logged in
      document.cookie = "justLoggedIn=true; path=/; max-age=60"
      setChecking(false)
    } else {
      checkAuth()
    }
  }, [router, supabase.auth])

  return null
}

