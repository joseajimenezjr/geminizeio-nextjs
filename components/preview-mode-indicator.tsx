"use client"

import { usePreviewMode } from "@/hooks/use-preview-mode"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Info } from "lucide-react"
import { useState, useEffect } from "react"

export function PreviewModeIndicator() {
  const { isPreviewMode } = usePreviewMode()
  const [identifier, setIdentifier] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isPreviewMode) {
      const savedIdentifier = localStorage.getItem("supabase_identifier")
      if (savedIdentifier) {
        setIdentifier(savedIdentifier)
      }
    }
  }, [isPreviewMode])

  if (!isPreviewMode) return null

  const handleExit = () => {
    // Clear localStorage
    localStorage.removeItem("supabase_access_token")
    localStorage.removeItem("supabase_identifier")

    // Clear cookie
    document.cookie = "preview_mode=; path=/; max-age=0"

    // Redirect to preview page
    router.push("/preview")
  }

  return (
    <Alert className="mb-4 bg-blue-500/10 border-blue-500 text-blue-700">
      <Info className="h-4 w-4" />
      <AlertTitle>Preview Mode</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span>You're viewing the app in preview mode with a saved token.</span>
          {identifier && <div className="text-xs mt-1">User: {identifier}</div>}
        </div>
        <Button variant="outline" size="sm" onClick={handleExit} className="ml-2 border-blue-500 text-blue-700">
          Exit Preview
        </Button>
      </AlertDescription>
    </Alert>
  )
}

