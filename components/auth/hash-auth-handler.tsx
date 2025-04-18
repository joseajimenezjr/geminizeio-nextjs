"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { setPreviewMode } from "@/lib/preview-mode"

export function HashAuthHandler() {
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Only run once
    if (initialized) return
    setInitialized(true)

    // Check for token in URL hash
    if (typeof window !== "undefined" && window.location.hash) {
      try {
        const hash = window.location.hash.substring(1) // Remove the # character
        const params = new URLSearchParams(hash)
        const token = params.get("token")
        const email = params.get("email")

        if (token) {
          console.log("Found token in URL hash")

          // Set preview mode with the token and email
          setPreviewMode(token, email || undefined)

          // Create a new URL object to properly handle the URL
          const currentUrl = new URL(window.location.href)

          // Remove the hash but keep the search parameters
          currentUrl.hash = ""

          console.log("Updating URL to:", currentUrl.toString())

          // Update the URL without reloading the page
          window.history.replaceState(null, document.title, currentUrl.toString())

          toast({
            title: "Preview Mode Active",
            description: email ? `You're now in preview mode as ${email}` : "You're now in preview mode",
          })
        }
      } catch (error) {
        console.error("Error parsing hash params:", error)
      }
    }
  }, [initialized, toast])

  return null // This component doesn't render anything
}

// Add TypeScript declaration for the global window object
declare global {
  interface Window {
    __PREVIEW_AUTH?: {
      token: string
      email: string | null
      timestamp: number
    }
  }
}
