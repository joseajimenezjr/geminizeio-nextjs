"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

// Helper function to check if we're in the V0 environment
function isInV0Environment(): boolean {
  if (typeof window === "undefined") return false

  return (
    window.location.hostname.includes("v0.dev") ||
    window.location.hostname.includes("vercel-v0") ||
    window.location.search.includes("v0preview=true")
  )
}

export function PreviewModeRouter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Only run in V0 environment
    if (!isInV0Environment()) return

    // Check if we're in preview mode
    const isPreviewMode = checkIfInPreviewMode()

    // If we're in preview mode but the URL doesn't have the preview_mode parameter,
    // add it and navigate to the new URL
    if (isPreviewMode && !searchParams.has("preview_mode")) {
      console.log("PreviewModeRouter: Adding preview_mode parameter to URL")

      // Create a new URL with the preview_mode parameter
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.set("preview_mode", "true")

      // Navigate to the new URL
      router.replace(`${pathname}?${newParams.toString()}`)
    }
  }, [pathname, searchParams, router])

  return null // This component doesn't render anything
}

// Helper function to check if we're in preview mode
function checkIfInPreviewMode(): boolean {
  if (typeof window === "undefined") return false

  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const previewParam = urlParams.get("preview_mode")

  // Check window object for token
  const hasPreviewAuth = typeof window !== "undefined" && !!window.__PREVIEW_AUTH?.token

  return !!(previewParam || hasPreviewAuth)
}
