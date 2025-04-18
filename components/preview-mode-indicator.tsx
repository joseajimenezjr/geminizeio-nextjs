"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Info } from "lucide-react"
import { getPreviewToken, clearPreviewMode } from "@/lib/preview-mode"

export function PreviewModeIndicator() {
  const [email, setEmail] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const router = useRouter()

  // Check if we're in the V0 environment
  const [isV0Environment, setIsV0Environment] = useState(false)

  useEffect(() => {
    // Check if we're in the V0 environment
    setIsV0Environment(
      typeof window !== "undefined" &&
        (window.location.hostname.includes("v0.dev") ||
          window.location.hostname.includes("vercel-v0") ||
          window.location.search.includes("v0preview=true")),
    )

    // Get token
    const previewToken = getPreviewToken()
    if (previewToken) {
      setToken(previewToken)
    }

    // Get email from localStorage
    try {
      const savedEmail = localStorage.getItem("supabase_email")
      if (savedEmail) setEmail(savedEmail)
    } catch (e) {
      console.warn("Could not access localStorage:", e)
    }
  }, [])

  // Only render in V0 environment
  if (!isV0Environment) return null

  const handleExit = () => {
    // Clear all preview mode data
    clearPreviewMode()

    // Redirect to home page without preview mode
    router.push("/")
  }

  return (
    <Alert className="mb-4 bg-blue-500/10 border-blue-500 text-blue-700">
      <Info className="h-4 w-4" />
      <AlertTitle>Preview Mode</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <div>
          <span>You're viewing the app in preview mode.</span>
          {email && <div className="text-xs mt-1">User: {email}</div>}
          {token && (
            <div className="text-xs mt-1">
              Token: {token.substring(0, 10)}...{token.substring(token.length - 5)}
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleExit} className="ml-2 border-blue-500 text-blue-700">
          Exit Preview
        </Button>
      </AlertDescription>
    </Alert>
  )
}
