"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface FetchOptions extends RequestInit {
  skipAuthHeader?: boolean
}

export function useApi() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const fetchWithAuth = useCallback(
    async (url: string, options: FetchOptions = {}) => {
      setIsLoading(true)

      try {
        // Prepare headers
        const headers = new Headers(options.headers || {})

        // Skip auth header if requested
        if (!options.skipAuthHeader) {
          // Try to get token from window object first
          let token = null
          if (typeof window !== "undefined" && window.__PREVIEW_AUTH?.token) {
            token = window.__PREVIEW_AUTH.token
          }
          // Fallback to localStorage
          else {
            try {
              token = localStorage.getItem("supabase_access_token")
            } catch (e) {
              console.warn("Could not access localStorage:", e)
            }
          }

          // Add Authorization header if token exists
          if (token) {
            headers.set("Authorization", `Bearer ${token}`)
          }
        }

        // Merge with existing options
        const fetchOptions = {
          ...options,
          headers,
        }

        // Remove our custom option
        if ("skipAuthHeader" in fetchOptions) {
          delete fetchOptions.skipAuthHeader
        }

        // Add preview_mode parameter to the URL if it's not already there
        let fetchUrl = url
        if (typeof window !== "undefined") {
          const currentUrl = new URL(window.location.href)
          if (currentUrl.searchParams.has("preview_mode") && !url.includes("preview_mode=")) {
            const urlObj = new URL(url, window.location.origin)
            urlObj.searchParams.set("preview_mode", "true")
            fetchUrl = urlObj.toString()
          }
        }

        console.log(`Fetching from ${fetchUrl}...`)
        const response = await fetch(fetchUrl, fetchOptions)

        if (!response.ok) {
          const contentType = response.headers.get("content-type")
          let errorMessage = `Request failed with status ${response.status}`

          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } else {
            // For non-JSON responses, just get the text
            const errorText = await response.text()
            console.error("Non-JSON error response:", errorText.substring(0, 200) + "...")
          }

          throw new Error(errorMessage)
        }

        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          return await response.json()
        } else {
          console.warn("Response is not JSON:", await response.text())
          return { error: "Unexpected response format" }
        }
      } catch (error: any) {
        console.error("API Error:", error)
        toast({
          title: "API Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        })
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  return { fetchWithAuth, isLoading }
}
