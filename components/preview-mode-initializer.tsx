"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { setPreviewMode, isPreviewMode, getPreviewToken } from "@/lib/preview-mode"

export function PreviewModeInitializer() {
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we're in preview mode
    const previewParam = searchParams?.get("preview_mode")
    const currentlyInPreviewMode = isPreviewMode()
    const token = getPreviewToken()

    console.log("PreviewModeInitializer check:", {
      previewParam,
      currentlyInPreviewMode,
      hasToken: !!token,
    })

    // If preview_mode parameter is present or we already have a token, ensure preview mode is set
    if (previewParam === "true" || token) {
      console.log("Setting preview mode")
      setPreviewMode(token || undefined)
    }
  }, [searchParams])

  return null // This component doesn't render anything
}
