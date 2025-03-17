"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info } from "lucide-react"
import Link from "next/link"

// Add this near the top of the file, after the imports
const debugValidation = async (token: string, identifier: string) => {
  try {
    console.log("Sending validation request with:", {
      token: token.substring(0, 10) + "...",
      identifier,
    })

    const response = await fetch("/api/auth/validate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ identifier }), // Include the identifier in the request body
    })

    const data = await response.json()
    console.log("Token validation response:", {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    })

    return { response, data }
  } catch (error) {
    console.error("Validation request failed:", error)
    throw error
  }
}

export function TokenInput() {
  // Update the state to be more generic
  const [identifier, setIdentifier] = useState("")
  // Replace email state with identifier state
  // const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Check if we already have a token
  // Update the useEffect to use the new state name
  useEffect(() => {
    const savedToken = localStorage.getItem("supabase_access_token")
    const savedIdentifier = localStorage.getItem("supabase_identifier")

    if (savedToken) {
      setToken(savedToken)
    }

    if (savedIdentifier) {
      setIdentifier(savedIdentifier)
    }
  }, [])

  // Update the validateToken function to use identifier instead of email
  const validateToken = async (token: string) => {
    try {
      setValidating(true)
      setError(null)
      setErrorCode(null)
      setStatusMessage("Validating token...")

      console.log("Starting token validation for:", {
        tokenLength: token.length,
        identifier,
      })

      const { response, data } = await debugValidation(token, identifier)

      if (!response.ok) {
        // Log the error details
        console.error("Validation failed:", {
          status: response.status,
          data,
        })

        if (data.code === "profile_not_found") {
          console.log("Profile not found details:", data.details)
          setErrorCode("profile_not_found")
        }
        throw new Error(data.error || "Invalid token")
      }

      console.log("Validation successful:", data)
      setStatusMessage("Token validated successfully!")
      return true
    } catch (error: any) {
      console.error("Token validation error:", error)

      // Provide more helpful error messages
      if (error.message.includes("profile not found")) {
        setError("User profile not found. You need to sign in normally first to create a profile.")
      } else if (error.message.includes("Failed to create user profile")) {
        setError("Failed to create a profile. Please try signing in normally first.")
      } else if (error.message.includes("invalid claim: missing sub claim")) {
        setError("Invalid token format. Please make sure you're using an access token, not a refresh token.")
      } else if (error.message.includes("invalid signature")) {
        setError("Invalid token signature. Please get a fresh token from your account.")
      } else if (error.message.includes("expired")) {
        setError("Token has expired. Please get a new token.")
      } else {
        setError(error.message || "Failed to validate token")
      }

      return false
    } finally {
      setValidating(false)
    }
  }

  // Update the handleSubmit function to use identifier instead of email
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setErrorCode(null)
    setStatusMessage(null)

    try {
      // Basic validation
      if (!token.trim()) {
        setError("Token is required")
        return
      }

      if (!identifier.trim()) {
        setError("Email or User ID is required")
        return
      }

      setStatusMessage("Validating token...")

      // Validate the token first
      const isValid = await validateToken(token)

      if (!isValid) {
        return
      }

      setStatusMessage("Saving token and setting up preview mode...")

      // Save token to localStorage
      localStorage.setItem("supabase_access_token", token)
      localStorage.setItem("supabase_identifier", identifier)

      // Set a cookie to indicate preview mode
      document.cookie = "preview_mode=true; path=/; max-age=86400" // 24 hours

      toast({
        title: "Success",
        description: "Token saved successfully. Redirecting to dashboard...",
      })

      // Add a small delay before redirecting
      setTimeout(() => {
        // Force a hard navigation to ensure the middleware picks up the token
        window.location.href = "/dashboard"
      }, 1000)
    } catch (error: any) {
      console.error("Error in token submission:", error)
      setError(error.message || "Failed to set token")
    } finally {
      setLoading(false)
    }
  }

  // Update the handleClear function
  const handleClear = () => {
    localStorage.removeItem("supabase_access_token")
    localStorage.removeItem("supabase_identifier")
    setToken("")
    setIdentifier("")
    setError(null)
    setErrorCode(null)
    setStatusMessage(null)
    toast({
      title: "Token Cleared",
      description: "Your access token has been removed",
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Preview Mode</CardTitle>
        <CardDescription>Enter your Supabase access token to use the app in preview mode</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Update the input field in the form */}
          <div className="space-y-2">
            <label htmlFor="identifier" className="text-sm font-medium">
              Email or User ID
            </label>
            <Input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Your email address or user ID"
              required
              disabled={loading || validating}
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
              disabled={loading || validating}
            />
            <p className="text-xs text-muted-foreground">
              You can get your access token from the Settings page or by using the token retriever tool.
            </p>
          </div>

          {errorCode === "profile_not_found" ? (
            <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-800" />
              <AlertTitle>Profile Not Found</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>Preview mode requires an existing user profile in the database.</p>
                <p>To use preview mode:</p>
                <ol className="list-decimal pl-5 text-sm mt-2 space-y-1">
                  <li>
                    First,{" "}
                    <Link href="/" className="font-medium underline">
                      sign in normally
                    </Link>{" "}
                    to create your profile
                  </li>
                  <li>Then, go to Settings → Developer Tools to get your access token</li>
                  <li>Finally, return to preview mode with that token</li>
                </ol>
                <p className="text-xs mt-2">
                  This ensures all app features will work correctly with your profile data.
                </p>
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {statusMessage && !error && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="flex items-center">
                {loading || validating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {statusMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            type="submit"
            className="w-full"
            disabled={loading || validating || errorCode === "profile_not_found"}
          >
            {loading || validating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {validating ? "Validating..." : "Processing..."}
              </>
            ) : (
              "Save Token & Continue"
            )}
          </Button>
          {token && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleClear}
              disabled={loading || validating}
            >
              Clear Token
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}

