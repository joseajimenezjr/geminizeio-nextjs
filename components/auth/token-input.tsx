"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Info } from "lucide-react"

export function TokenInput() {
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check if we already have a token
  useState(() => {
    // Try to get token from localStorage as a fallback
    try {
      const savedToken = localStorage.getItem("supabase_access_token")
      const savedEmail = localStorage.getItem("supabase_email")

      if (savedToken) {
        setToken(savedToken)
        console.log("Found saved token in localStorage")
      }

      if (savedEmail) {
        setEmail(savedEmail)
        console.log("Found saved email in localStorage:", savedEmail)
      }
    } catch (e) {
      console.warn("Could not access localStorage:", e)
    }
  })

  // Simple validation function
  const validateToken = async (token: string) => {
    try {
      setLoading(true)
      setError(null)
      setStatusMessage("Validating token...")

      // Basic validation - just check if the token looks like a JWT
      if (!token.includes(".") || token.split(".").length !== 3) {
        throw new Error("Invalid token format. Please provide a valid JWT token.")
      }

      setStatusMessage("Token format validated!")
      return true
    } catch (error: any) {
      setError(error.message || "Failed to validate token")
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setStatusMessage(null)
    setDebugInfo(null)

    try {
      // Basic validation
      if (!token.trim()) {
        setError("Token is required")
        setLoading(false)
        return
      }

      if (!email.trim()) {
        setError("Email is required")
        setLoading(false)
        return
      }

      setStatusMessage("Validating token...")

      // Validate the token format
      const isValid = await validateToken(token)

      if (!isValid) {
        setLoading(false)
        return
      }

      setStatusMessage("Preparing for preview mode...")

      // Save to localStorage
      try {
        localStorage.setItem("supabase_access_token", token)
        localStorage.setItem("supabase_email", email)
      } catch (e) {
        console.warn("Could not save to localStorage:", e)
      }

      // Encode the token and email for URL safety
      const encodedToken = encodeURIComponent(token)
      const encodedEmail = encodeURIComponent(email)

      // Set up the global window object for client-side access
      if (typeof window !== "undefined") {
        window.__PREVIEW_AUTH = {
          token,
          email,
          timestamp: Date.now(),
        }
      }

      setStatusMessage("Redirecting to dashboard...")

      // IMPORTANT: Construct the URL properly to ensure the preview_mode parameter is included
      const dashboardUrl = new URL("/dashboard", window.location.origin)
      dashboardUrl.searchParams.set("preview_mode", "true")
      dashboardUrl.hash = `token=${encodedToken}&email=${encodedEmail}`

      console.log("Redirecting to:", dashboardUrl.toString())

      // Use the constructed URL for redirection
      window.location.href = dashboardUrl.toString()

      toast({
        title: "Success",
        description: "Credentials prepared for preview mode. Redirecting to dashboard...",
      })
    } catch (error: any) {
      console.error("Error in token submission:", error)
      setError(error.message || "Failed to set token")
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    // Clear form
    setToken("")
    setEmail("")
    setError(null)
    setStatusMessage(null)
    setDebugInfo(null)

    // Try to clear localStorage
    try {
      localStorage.removeItem("supabase_access_token")
      localStorage.removeItem("supabase_email")
    } catch (e) {
      console.warn("Could not clear localStorage:", e)
    }

    toast({
      title: "Credentials Cleared",
      description: "Your preview mode credentials have been removed",
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Preview Mode</CardTitle>
        <CardDescription>Enter your Supabase credentials to use the app in preview mode</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="token" className="text-sm font-medium">
              Access Token
            </label>
            <Input
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              You can get your access token from the Settings page after logging in normally.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {statusMessage && !error && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="flex items-center">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {statusMessage}
              </AlertDescription>
            </Alert>
          )}

          {debugInfo && (
            <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
              <p>Debug info:</p>
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loading ? "Processing..." : ""}
              </>
            ) : (
              "Save Credentials & Continue"
            )}
          </Button>
          {token && (
            <Button type="button" variant="outline" className="w-full" onClick={handleClear} disabled={loading}>
              Clear Credentials
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
